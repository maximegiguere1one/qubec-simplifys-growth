
-- 1) Table de configuration email
CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  from_name TEXT NOT NULL DEFAULT 'Lovable',
  from_email TEXT NOT NULL,
  reply_to TEXT NULL,
  default_sequence TEXT NULL,
  sending_paused BOOLEAN NOT NULL DEFAULT FALSE,
  daily_send_limit INTEGER NULL,
  test_recipient TEXT NULL
);

-- RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Lecture publique (UI peut lire les réglages non sensibles)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'email_settings' AND policyname = 'Public can read email settings'
  ) THEN
    CREATE POLICY "Public can read email settings"
      ON public.email_settings
      FOR SELECT
      USING (true);
  END IF;
END$$;

-- Interdire écriture publique (seul service_role pourra écrire via policy dédiée)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'email_settings' AND policyname = 'No public insert on email_settings'
  ) THEN
    CREATE POLICY "No public insert on email_settings"
      ON public.email_settings
      FOR INSERT
      WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'email_settings' AND policyname = 'No public update on email_settings'
  ) THEN
    CREATE POLICY "No public update on email_settings"
      ON public.email_settings
      FOR UPDATE
      USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'email_settings' AND policyname = 'No public delete on email_settings'
  ) THEN
    CREATE POLICY "No public delete on email_settings"
      ON public.email_settings
      FOR DELETE
      USING (false);
  END IF;
END$$;

-- Pleins pouvoirs pour service_role (écriture via Edge Function)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'email_settings' AND policyname = 'Service role full access to email_settings'
  ) THEN
    CREATE POLICY "Service role full access to email_settings"
      ON public.email_settings
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;

-- Trigger updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_email_settings'
  ) THEN
    CREATE TRIGGER set_updated_at_email_settings
      BEFORE UPDATE ON public.email_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 2) Fonction RPC: get_dashboard_metrics
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(days_back integer DEFAULT 30)
RETURNS TABLE(
  total_leads BIGINT,
  quiz_completions BIGINT,
  vsl_views BIGINT,
  bookings BIGINT,
  conversion_rate NUMERIC,
  avg_quiz_score NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH leads_cte AS (
    SELECT COUNT(*)::bigint AS c
    FROM public.leads
    WHERE created_at >= NOW() - (days_back || ' days')::interval
  ),
  quiz_cte AS (
    SELECT COUNT(*)::bigint AS c, AVG(total_score)::numeric AS avg_score
    FROM public.quiz_sessions
    WHERE status = 'completed'
      AND started_at >= NOW() - (days_back || ' days')::interval
  ),
  vsl_cte AS (
    SELECT COUNT(*)::bigint AS c
    FROM public.funnel_events
    WHERE event_type = 'vsl_view'
      AND created_at >= NOW() - (days_back || ' days')::interval
  ),
  bookings_cte AS (
    SELECT COUNT(*)::bigint AS c
    FROM public.bookings
    WHERE created_at >= NOW() - (days_back || ' days')::interval
  )
  SELECT
    l.c as total_leads,
    q.c as quiz_completions,
    v.c as vsl_views,
    b.c as bookings,
    CASE WHEN l.c > 0 THEN ROUND((b.c::numeric / l.c::numeric) * 100, 2) ELSE 0 END as conversion_rate,
    COALESCE(ROUND(q.avg_score, 2), 0) as avg_quiz_score
  FROM leads_cte l, quiz_cte q, vsl_cte v, bookings_cte b;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics(integer) TO anon;

-- 3) Fonction RPC: résultats A/B (pour ExperimentTracker)
CREATE OR REPLACE FUNCTION public.get_experiment_results(days_back integer DEFAULT 30)
RETURNS TABLE(
  test_name TEXT,
  variant TEXT,
  total_views BIGINT,
  conversions BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH assignments AS (
    SELECT 
      (event_data->>'test_name')::text AS test_name,
      (event_data->>'variant')::text AS variant,
      (event_data->>'session_id')::text AS session_id
    FROM public.funnel_events
    WHERE event_type = 'quiz_question_answer'
      AND event_data->>'event_type' = 'ab_test_assignment'
      AND created_at >= NOW() - (days_back || ' days')::interval
  ),
  conv_events AS (
    SELECT 
      event_type::text,
      (event_data->>'session_id')::text AS session_id
    FROM public.funnel_events
    WHERE event_type IN ('lp_submit_optin','quiz_complete','vsl_cta_click','bookcall_submit')
      AND created_at >= NOW() - (days_back || ' days')::interval
  ),
  mapping(test_name, event_type) AS (
    VALUES 
      ('landing_cta','lp_submit_optin'),
      ('headline_variant','lp_submit_optin'),
      ('quiz_progress_motivation','quiz_complete'),
      ('vsl_cta_overlay','vsl_cta_click'),
      ('booking_urgency','bookcall_submit')
  ),
  views AS (
    SELECT test_name, variant, COUNT(DISTINCT session_id)::bigint AS total_views
    FROM assignments
    GROUP BY 1,2
  ),
  convs AS (
    SELECT a.test_name, a.variant, COUNT(DISTINCT a.session_id)::bigint AS conversions
    FROM assignments a
    JOIN conv_events c ON c.session_id = a.session_id
    JOIN mapping m ON m.test_name = a.test_name AND m.event_type = c.event_type
    GROUP BY 1,2
  )
  SELECT 
    v.test_name,
    v.variant,
    v.total_views,
    COALESCE(c.conversions,0) AS conversions,
    CASE WHEN v.total_views > 0 THEN ROUND((COALESCE(c.conversions,0)::numeric / v.total_views::numeric) * 100, 2) ELSE 0 END AS conversion_rate
  FROM views v
  LEFT JOIN convs c
    ON c.test_name = v.test_name AND c.variant = v.variant
  ORDER BY test_name, variant;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_experiment_results(integer) TO anon;

-- 4) Fonction RPC: métriques avancées (pour AdvancedAnalytics)
CREATE OR REPLACE FUNCTION public.get_advanced_metrics(days_back integer DEFAULT 30)
RETURNS TABLE(
  total_visitors BIGINT,
  lead_capture_rate NUMERIC,
  quiz_start_rate NUMERIC,
  quiz_completion_rate NUMERIC,
  average_lead_score NUMERIC,
  qualified_leads_count BIGINT,
  hot_leads_count BIGINT,
  warm_leads_count BIGINT,
  cold_leads_count BIGINT,
  consultation_booking_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pageviews BIGINT;
  v_quiz_starts BIGINT;
  v_quiz_completes BIGINT;
  v_leads BIGINT;
  v_bookings BIGINT;
  v_avg_score NUMERIC;
  v_qualified BIGINT;
  v_hot BIGINT;
  v_warm BIGINT;
  v_cold BIGINT;
BEGIN
  SELECT COUNT(*)::bigint INTO v_pageviews
  FROM public.funnel_events
  WHERE event_type = 'lp_view'
    AND created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*)::bigint INTO v_quiz_starts
  FROM public.funnel_events
  WHERE event_type = 'quiz_start'
    AND created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*)::bigint INTO v_quiz_completes
  FROM public.quiz_sessions
  WHERE status = 'completed'
    AND started_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*)::bigint, AVG(score)::numeric
  INTO v_leads, v_avg_score
  FROM public.leads
  WHERE created_at >= NOW() - (days_back || ' days')::interval;

  SELECT 
    COUNT(*) FILTER (WHERE segment = 'qualified')::bigint,
    COUNT(*) FILTER (WHERE segment = 'hot')::bigint,
    COUNT(*) FILTER (WHERE segment = 'warm')::bigint,
    COUNT(*) FILTER (WHERE segment = 'cold')::bigint
  INTO v_qualified, v_hot, v_warm, v_cold
  FROM public.leads
  WHERE created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*)::bigint INTO v_bookings
  FROM public.bookings
  WHERE created_at >= NOW() - (days_back || ' days')::interval;

  RETURN QUERY SELECT
    v_pageviews AS total_visitors,
    CASE WHEN v_pageviews > 0 THEN ROUND((v_leads::numeric / v_pageviews::numeric) * 100, 2) ELSE 0 END AS lead_capture_rate,
    CASE WHEN v_pageviews > 0 THEN ROUND((v_quiz_starts::numeric / v_pageviews::numeric) * 100, 2) ELSE 0 END AS quiz_start_rate,
    CASE WHEN v_quiz_starts > 0 THEN ROUND((v_quiz_completes::numeric / v_quiz_starts::numeric) * 100, 2) ELSE 0 END AS quiz_completion_rate,
    COALESCE(ROUND(v_avg_score, 2), 0) AS average_lead_score,
    v_qualified AS qualified_leads_count,
    v_hot AS hot_leads_count,
    v_warm AS warm_leads_count,
    v_cold AS cold_leads_count,
    CASE WHEN v_leads > 0 THEN ROUND((v_bookings::numeric / v_leads::numeric) * 100, 2) ELSE 0 END AS consultation_booking_rate;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_advanced_metrics(integer) TO anon;
