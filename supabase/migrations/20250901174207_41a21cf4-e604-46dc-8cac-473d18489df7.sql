-- Phase 0: Immediate stabilization - Fix RLS and create secure functions

-- First, let's create a profiles table for admin users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create secure RPC functions for lead management
CREATE OR REPLACE FUNCTION public.get_leads_secure(
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0,
  segment_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  phone TEXT,
  company TEXT,
  score INTEGER,
  segment TEXT,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    l.id,
    l.email,
    l.name,
    l.phone,
    l.company,
    l.score,
    l.segment,
    l.source,
    l.utm_source,
    l.utm_medium,
    l.utm_campaign,
    l.created_at,
    l.updated_at
  FROM public.leads l
  WHERE (segment_filter IS NULL OR l.segment = segment_filter)
  ORDER BY l.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Create function to get lead details with related data
CREATE OR REPLACE FUNCTION public.get_lead_details_secure(lead_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'lead', row_to_json(l.*),
    'quiz_sessions', COALESCE(quiz_data.sessions, '[]'::json),
    'bookings', COALESCE(booking_data.bookings, '[]'::json),
    'funnel_events', COALESCE(event_data.events, '[]'::json)
  ) INTO result
  FROM public.leads l
  LEFT JOIN (
    SELECT 
      qs.lead_id,
      json_agg(row_to_json(qs.*)) as sessions
    FROM public.quiz_sessions qs
    WHERE qs.lead_id = get_lead_details_secure.lead_id
    GROUP BY qs.lead_id
  ) quiz_data ON quiz_data.lead_id = l.id
  LEFT JOIN (
    SELECT 
      b.lead_id,
      json_agg(row_to_json(b.*)) as bookings
    FROM public.bookings b
    WHERE b.lead_id = get_lead_details_secure.lead_id
    GROUP BY b.lead_id
  ) booking_data ON booking_data.lead_id = l.id
  LEFT JOIN (
    SELECT 
      fe.lead_id,
      json_agg(row_to_json(fe.*)) as events
    FROM public.funnel_events fe
    WHERE fe.lead_id = get_lead_details_secure.lead_id
    ORDER BY fe.created_at DESC
    LIMIT 50
    GROUP BY fe.lead_id
  ) event_data ON event_data.lead_id = l.id
  WHERE l.id = get_lead_details_secure.lead_id;

  RETURN result;
END;
$$;

-- Create function to update lead scoring
CREATE OR REPLACE FUNCTION public.update_lead_scoring_secure(
  lead_id UUID,
  new_score INTEGER,
  new_segment TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Validate segment
  IF new_segment NOT IN ('cold', 'warm', 'hot', 'qualified') THEN
    RAISE EXCEPTION 'Invalid segment. Must be one of: cold, warm, hot, qualified';
  END IF;

  -- Update the lead
  UPDATE public.leads 
  SET 
    score = new_score,
    segment = new_segment,
    updated_at = now()
  WHERE id = lead_id;

  RETURN FOUND;
END;
$$;

-- Create analytics function for dashboard
CREATE OR REPLACE FUNCTION public.get_leads_analytics_secure(days_back INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'total_leads', COUNT(*),
    'qualified_leads', COUNT(*) FILTER (WHERE segment = 'qualified'),
    'hot_leads', COUNT(*) FILTER (WHERE segment = 'hot'),
    'warm_leads', COUNT(*) FILTER (WHERE segment = 'warm'),
    'cold_leads', COUNT(*) FILTER (WHERE segment = 'cold'),
    'average_score', ROUND(AVG(score), 2),
    'conversion_rate', ROUND(
      (COUNT(*) FILTER (WHERE segment IN ('qualified', 'hot'))::numeric / 
       NULLIF(COUNT(*)::numeric, 0)) * 100, 2
    ),
    'leads_by_source', json_agg(DISTINCT jsonb_build_object(
      'source', COALESCE(source, 'unknown'),
      'count', source_counts.count
    ))
  ) INTO result
  FROM public.leads l
  LEFT JOIN (
    SELECT 
      COALESCE(source, 'unknown') as source,
      COUNT(*) as count
    FROM public.leads
    WHERE created_at >= NOW() - (days_back || ' days')::interval
    GROUP BY COALESCE(source, 'unknown')
  ) source_counts ON source_counts.source = COALESCE(l.source, 'unknown')
  WHERE l.created_at >= NOW() - (days_back || ' days')::interval;

  RETURN result;
END;
$$;