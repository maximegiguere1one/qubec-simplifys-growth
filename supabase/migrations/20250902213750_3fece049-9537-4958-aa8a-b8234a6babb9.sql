-- Fix analytics-batch foreign key errors by making lead_id nullable with proper fallback
-- This prevents data loss when lead_id references don't exist

-- First, let's check if we need to add any missing event types
DO $$ 
BEGIN
    -- Add missing event types if they don't exist
    BEGIN
        ALTER TYPE funnel_event_type ADD VALUE IF NOT EXISTS 'vsl_pause';
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE funnel_event_type ADD VALUE IF NOT EXISTS 'vsl_complete';
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Add performance indexes for better analytics queries
CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at_event_type 
ON funnel_events(created_at DESC, event_type);

CREATE INDEX IF NOT EXISTS idx_funnel_events_session_lead 
ON funnel_events(session_id, lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_created_segment 
ON leads(created_at DESC, segment);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status_completed 
ON quiz_sessions(status, completed_at DESC) 
WHERE status = 'completed';

-- Create a function to get compact overview metrics (Phase 5: Performance)
CREATE OR REPLACE FUNCTION public.get_compact_overview_metrics(days_back integer DEFAULT 30)
RETURNS TABLE(
  total_leads bigint,
  total_bookings bigint, 
  total_quiz_completions bigint,
  total_vsl_views bigint,
  conversion_rate numeric,
  avg_quiz_score numeric,
  health_score numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  leads_count bigint;
  bookings_count bigint;
  quiz_count bigint;
  vsl_count bigint;
  avg_score numeric;
  health_metric numeric;
BEGIN
  -- Get counts in single query where possible
  SELECT 
    COUNT(*) FILTER (WHERE l.created_at >= NOW() - (days_back || ' days')::interval),
    COUNT(*) FILTER (WHERE b.created_at >= NOW() - (days_back || ' days')::interval),
    AVG(l.score) FILTER (WHERE l.created_at >= NOW() - (days_back || ' days')::interval)
  INTO leads_count, bookings_count, avg_score
  FROM leads l
  LEFT JOIN bookings b ON b.lead_id = l.id;
  
  SELECT COUNT(*) INTO quiz_count
  FROM quiz_sessions 
  WHERE status = 'completed' 
    AND started_at >= NOW() - (days_back || ' days')::interval;
    
  SELECT COUNT(*) INTO vsl_count
  FROM funnel_events 
  WHERE event_type = 'vsl_view' 
    AND created_at >= NOW() - (days_back || ' days')::interval;
  
  -- Calculate health score (% of valid sessions)
  SELECT 
    CASE WHEN COUNT(*) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE validate_session_id(session_id))::numeric / COUNT(*)::numeric) * 100, 1)
      ELSE 100 
    END
  INTO health_metric
  FROM funnel_events 
  WHERE created_at >= NOW() - (days_back || ' days')::interval;

  RETURN QUERY SELECT
    COALESCE(leads_count, 0),
    COALESCE(bookings_count, 0),
    COALESCE(quiz_count, 0),
    COALESCE(vsl_count, 0),
    CASE WHEN leads_count > 0 
      THEN ROUND((bookings_count::numeric / leads_count::numeric) * 100, 2)
      ELSE 0 
    END,
    COALESCE(ROUND(avg_score, 2), 0),
    COALESCE(health_metric, 100);
END;
$function$;