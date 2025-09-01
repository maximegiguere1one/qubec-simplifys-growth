-- Fix VSL engagement analysis function to handle enum types correctly
CREATE OR REPLACE FUNCTION public.get_vsl_engagement_analysis(days_back integer DEFAULT 30)
 RETURNS TABLE(time_bucket text, play_events bigint, pause_events bigint, completion_events bigint, avg_watch_duration numeric, engagement_rate numeric, cta_clicks bigint, cta_conversion_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH vsl_events AS (
    SELECT 
      fe.event_type::text as event_type_text,
      fe.event_data,
      fe.session_id,
      CASE 
        WHEN EXTRACT(hour FROM fe.created_at) BETWEEN 6 AND 11 THEN 'Matin (6h-11h)'
        WHEN EXTRACT(hour FROM fe.created_at) BETWEEN 12 AND 17 THEN 'Apres-midi (12h-17h)'  
        WHEN EXTRACT(hour FROM fe.created_at) BETWEEN 18 AND 22 THEN 'Soir (18h-22h)'
        ELSE 'Nuit (23h-5h)'
      END as time_period
    FROM public.funnel_events fe
    WHERE fe.event_type::text IN ('vsl_play', 'vsl_pause', 'vsl_complete', 'vsl_cta_click')
    AND fe.created_at >= NOW() - (days_back || ' days')::interval
  )
  SELECT 
    ve.time_period,
    COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_play')::bigint as play_events,
    COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_pause')::bigint as pause_events,
    COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_complete')::bigint as completion_events,
    AVG(COALESCE((ve.event_data->>'duration')::numeric, 0)) as avg_watch_duration,
    CASE WHEN COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_play') > 0
      THEN ROUND(
        (COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_complete')::numeric / 
         COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_play')::numeric) * 100, 2
      )
      ELSE 0
    END as engagement_rate,
    COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_cta_click')::bigint as cta_clicks,
    CASE WHEN COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_complete') > 0
      THEN ROUND(
        (COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_cta_click')::numeric /
         COUNT(*) FILTER (WHERE ve.event_type_text = 'vsl_complete')::numeric) * 100, 2
      )
      ELSE 0  
    END as cta_conversion_rate
  FROM vsl_events ve
  GROUP BY ve.time_period
  ORDER BY 
    CASE ve.time_period
      WHEN 'Matin (6h-11h)' THEN 1
      WHEN 'Apres-midi (12h-17h)' THEN 2  
      WHEN 'Soir (18h-22h)' THEN 3
      ELSE 4
    END;
END;
$function$;

-- Fix experiment results function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.get_experiment_results(days_back integer DEFAULT 30)
 RETURNS TABLE(test_name text, variant text, total_views bigint, conversions bigint, conversion_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH assignments AS (
    SELECT 
      (event_data->>'test_name')::text AS test_name,
      (event_data->>'variant')::text AS variant,
      (event_data->>'session_id')::text AS session_id
    FROM public.funnel_events
    WHERE event_type::text = 'quiz_question_answer'
      AND event_data->>'event_type' = 'ab_test_assignment'
      AND created_at >= NOW() - (days_back || ' days')::interval
  ),
  conv_events AS (
    SELECT 
      event_type::text,
      (event_data->>'session_id')::text AS session_id
    FROM public.funnel_events
    WHERE event_type::text IN ('lp_submit_optin','quiz_complete','vsl_cta_click','bookcall_submit')
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
    GROUP BY test_name, variant
  ),
  convs AS (
    SELECT a.test_name, a.variant, COUNT(DISTINCT a.session_id)::bigint AS conversions
    FROM assignments a
    JOIN conv_events c ON c.session_id = a.session_id
    JOIN mapping m ON m.test_name = a.test_name AND m.event_type = c.event_type
    GROUP BY a.test_name, a.variant
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
  ORDER BY v.test_name, v.variant;
END;
$function$;

-- Fix trended dashboard metrics function to handle GROUP BY correctly
CREATE OR REPLACE FUNCTION public.get_trended_dashboard_metrics(days_back integer DEFAULT 30, compare_period boolean DEFAULT true)
 RETURNS TABLE(date date, total_leads bigint, quiz_completions bigint, vsl_views bigint, bookings bigint, conversion_rate numeric, avg_quiz_score numeric, previous_period_leads bigint, previous_period_bookings bigint, previous_period_conversion numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      (CURRENT_DATE - (days_back || ' days')::interval)::date,
      CURRENT_DATE,
      '1 day'::interval
    )::date as metric_date
  ),
  daily_metrics AS (
    SELECT 
      d.metric_date,
      COUNT(l.id) as leads_count,
      COUNT(qs.id) FILTER (WHERE qs.status = 'completed') as quiz_count,
      COUNT(fe.id) FILTER (WHERE fe.event_type::text = 'vsl_view') as vsl_count,
      COUNT(b.id) as booking_count,
      AVG(qs.total_score) as avg_score
    FROM date_series d
    LEFT JOIN public.leads l ON l.created_at::date = d.metric_date
    LEFT JOIN public.quiz_sessions qs ON qs.lead_id = l.id AND qs.status = 'completed'
    LEFT JOIN public.funnel_events fe ON fe.event_type::text = 'vsl_view' AND fe.created_at::date = d.metric_date
    LEFT JOIN public.bookings b ON b.created_at::date = d.metric_date
    GROUP BY d.metric_date
  ),
  comparison_metrics AS (
    SELECT 
      date_trunc('day', l.created_at)::date as metric_date,
      COUNT(l.id) as prev_leads_count,
      COUNT(b.id) as prev_booking_count
    FROM public.leads l
    LEFT JOIN public.bookings b ON b.created_at::date = l.created_at::date
    WHERE l.created_at::date BETWEEN 
      (CURRENT_DATE - (2 * days_back || ' days')::interval)::date AND
      (CURRENT_DATE - (days_back || ' days')::interval)::date
    GROUP BY date_trunc('day', l.created_at)::date
  )
  SELECT 
    dm.metric_date::date,
    dm.leads_count::bigint,
    dm.quiz_count::bigint,
    dm.vsl_count::bigint,
    dm.booking_count::bigint,
    CASE WHEN dm.leads_count > 0 
      THEN ROUND((dm.booking_count::numeric / dm.leads_count::numeric) * 100, 2)
      ELSE 0 
    END as conversion_rate,
    COALESCE(ROUND(dm.avg_score, 2), 0) as avg_quiz_score,
    COALESCE(cm.prev_leads_count, 0)::bigint as previous_period_leads,
    COALESCE(cm.prev_booking_count, 0)::bigint as previous_period_bookings,
    CASE WHEN cm.prev_leads_count > 0
      THEN ROUND((cm.prev_booking_count::numeric / cm.prev_leads_count::numeric) * 100, 2)
      ELSE 0
    END as previous_period_conversion
  FROM daily_metrics dm
  LEFT JOIN comparison_metrics cm ON cm.metric_date = dm.metric_date - (days_back || ' days')::interval
  ORDER BY dm.metric_date;
END;
$function$;