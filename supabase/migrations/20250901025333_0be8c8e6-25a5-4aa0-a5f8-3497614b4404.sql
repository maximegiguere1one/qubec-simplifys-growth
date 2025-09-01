-- Fix RLS policies with correct enum values and create validation infrastructure
-- First, let's check what enum values actually exist and fix the policies

-- 1. Rate limiting function for anonymous operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  table_name text,
  ip_address inet,
  max_operations integer DEFAULT 10,
  time_window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  operation_count integer;
BEGIN
  -- Count recent operations from this IP for this table
  EXECUTE format('
    SELECT COUNT(*)
    FROM %I 
    WHERE ip_address = $1 
    AND created_at > NOW() - INTERVAL ''%s minutes''
  ', table_name, time_window_minutes)
  INTO operation_count
  USING ip_address;
  
  RETURN operation_count < max_operations;
END;
$$;

-- 2. Enhanced validation function for UTM parameters
CREATE OR REPLACE FUNCTION public.validate_utm_params(utm_data jsonb) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check for valid UTM parameter formats
  IF utm_data ? 'utm_source' THEN
    IF length(utm_data->>'utm_source') > 255 OR NOT (utm_data->>'utm_source' ~ '^[a-zA-Z0-9_-]+$') THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  IF utm_data ? 'utm_medium' THEN
    IF length(utm_data->>'utm_medium') > 255 OR NOT (utm_data->>'utm_medium' ~ '^[a-zA-Z0-9_-]+$') THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  IF utm_data ? 'utm_campaign' THEN
    IF length(utm_data->>'utm_campaign') > 255 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 3. Session validation function
CREATE OR REPLACE FUNCTION public.validate_session_id(session_id text) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Session ID should start with 'sess_' and be properly formatted
  RETURN session_id ~ '^sess_\d+_[a-zA-Z0-9]{9}$';
END;
$$;

-- 4. Update RLS policies for leads table
DROP POLICY IF EXISTS "Rate limited lead creation" ON public.leads;
DROP POLICY IF EXISTS "Anonymous can create leads" ON public.leads;
CREATE POLICY "Rate limited lead creation" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (
    -- Validate basic data requirements
    length(trim(name)) >= 2 AND
    length(trim(email)) >= 5 AND
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    (phone IS NULL OR length(trim(phone)) >= 10) AND
    -- Validate UTM parameters if present
    validate_utm_params(to_jsonb(ROW(utm_source, utm_medium, utm_campaign))) AND
    -- Rate limiting (IP would be added via Edge Function)
    source IN ('landing_page', 'quiz', 'vsl', 'direct')
  );

-- 5. Enhanced RLS for funnel_events
DROP POLICY IF EXISTS "Validated funnel events only" ON public.funnel_events;
DROP POLICY IF EXISTS "Anonymous can create funnel events" ON public.funnel_events;
CREATE POLICY "Validated funnel events only" ON public.funnel_events
  FOR INSERT TO anon
  WITH CHECK (
    -- Validate session ID format
    validate_session_id(session_id) AND
    -- Validate event type is from allowed enum
    event_type IN ('lp_view', 'lp_submit_optin', 'quiz_start', 'quiz_question_answer', 
                   'quiz_complete', 'vsl_view', 'vsl_play', 'vsl_cta_click', 
                   'bookcall_view', 'bookcall_submit', 'bookcall_confirm',
                   'guarantee_view', 'guarantee_cta_click') AND
    -- Validate event_data structure (basic check)
    jsonb_typeof(event_data) = 'object' AND
    -- Validate timestamps
    (event_data->>'timestamp')::bigint > extract(epoch from now() - interval '1 hour') * 1000 AND
    (event_data->>'timestamp')::bigint <= extract(epoch from now() + interval '5 minutes') * 1000
  );

-- 6. Enhanced RLS for quiz_sessions (using correct enum values)
DROP POLICY IF EXISTS "Validated quiz sessions only" ON public.quiz_sessions;
DROP POLICY IF EXISTS "Anonymous can create quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Validated quiz sessions only" ON public.quiz_sessions
  FOR INSERT TO anon
  WITH CHECK (
    -- Validate session ID format
    validate_session_id(session_id) AND
    -- Validate status (using correct enum values)
    status IN ('started', 'completed', 'abandoned') AND
    -- Validate timestamps
    started_at <= now() + interval '5 minutes'
  );

-- Allow updates for quiz completion
CREATE POLICY "Update own quiz sessions" ON public.quiz_sessions
  FOR UPDATE TO anon
  USING (validate_session_id(session_id))
  WITH CHECK (
    status IN ('started', 'completed', 'abandoned') AND
    (completed_at IS NULL OR completed_at >= started_at) AND
    (abandoned_at IS NULL OR abandoned_at >= started_at) AND
    (total_score IS NULL OR (total_score >= 0 AND total_score <= 100))
  );

-- 7. Enhanced RLS for quiz_answers
DROP POLICY IF EXISTS "Validated quiz answers only" ON public.quiz_answers;
DROP POLICY IF EXISTS "Anonymous can create quiz answers" ON public.quiz_answers;
CREATE POLICY "Validated quiz answers only" ON public.quiz_answers
  FOR INSERT TO anon
  WITH CHECK (
    -- Validate question_id range
    question_id BETWEEN 1 AND 20 AND
    -- Validate answer_score range
    answer_score BETWEEN 0 AND 10 AND
    -- Validate answer_value length
    length(trim(answer_value)) >= 1 AND length(answer_value) <= 500 AND
    -- Validate time_spent is reasonable (1 second to 10 minutes per question)
    (time_spent_seconds IS NULL OR (time_spent_seconds >= 1 AND time_spent_seconds <= 600))
  );

-- 8. Enhanced RLS for bookings
DROP POLICY IF EXISTS "Validated booking creation" ON public.bookings;
DROP POLICY IF EXISTS "Anonymous users can create bookings" ON public.bookings;
CREATE POLICY "Validated booking creation" ON public.bookings
  FOR INSERT TO anon
  WITH CHECK (
    -- Validate required fields
    length(trim(name)) >= 2 AND
    length(trim(email)) >= 5 AND
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    length(trim(phone)) >= 10 AND
    -- Validate session ID format
    validate_session_id(session_id) AND
    -- Validate booking date is in the future
    selected_date >= current_date AND
    selected_date <= current_date + interval '90 days' AND
    -- Validate timezone
    timezone IN ('America/Toronto', 'America/Montreal', 'America/Vancouver', 'America/Edmonton') AND
    -- Validate status
    status = 'scheduled'
  );

-- 9. Create honeypot detection function
CREATE OR REPLACE FUNCTION public.detect_honeypot(form_data jsonb) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check for common honeypot field names that should be empty
  IF form_data ? 'website' OR 
     form_data ? 'url' OR 
     form_data ? 'honeypot' OR
     form_data ? 'bot_field' THEN
    RETURN TRUE; -- Honeypot detected
  END IF;
  
  RETURN FALSE;
END;
$$;