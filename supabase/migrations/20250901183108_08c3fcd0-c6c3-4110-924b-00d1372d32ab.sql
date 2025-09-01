-- Enhanced Analytics Functions for 10x Dashboard (Fixed quotes)

-- 1. Get trended dashboard metrics with comparison
CREATE OR REPLACE FUNCTION public.get_trended_dashboard_metrics(
  days_back integer DEFAULT 30,
  compare_period boolean DEFAULT true
)
RETURNS TABLE(
  date date,
  total_leads bigint,
  quiz_completions bigint,
  vsl_views bigint,
  bookings bigint,
  conversion_rate numeric,
  avg_quiz_score numeric,
  previous_period_leads bigint,
  previous_period_bookings bigint,
  previous_period_conversion numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH daily_metrics AS (
    SELECT 
      l.created_at::date as metric_date,
      COUNT(l.id) as leads_count,
      COUNT(qs.id) FILTER (WHERE qs.status = 'completed') as quiz_count,
      COUNT(fe.id) FILTER (WHERE fe.event_type = 'vsl_view') as vsl_count,
      COUNT(b.id) as booking_count,
      AVG(qs.total_score) as avg_score
    FROM generate_series(
      (CURRENT_DATE - (days_back || ' days')::interval)::date,
      CURRENT_DATE,
      '1 day'::interval
    ) d(metric_date)
    LEFT JOIN public.leads l ON l.created_at::date = d.metric_date
    LEFT JOIN public.quiz_sessions qs ON qs.lead_id = l.id AND qs.status = 'completed'
    LEFT JOIN public.funnel_events fe ON fe.event_type = 'vsl_view' AND fe.created_at::date = d.metric_date
    LEFT JOIN public.bookings b ON b.created_at::date = d.metric_date
    GROUP BY d.metric_date
  ),
  comparison_metrics AS (
    SELECT 
      l.created_at::date as metric_date,
      COUNT(l.id) as prev_leads_count,
      COUNT(b.id) as prev_booking_count
    FROM public.leads l
    LEFT JOIN public.bookings b ON b.created_at::date = l.created_at::date
    WHERE l.created_at::date BETWEEN 
      (CURRENT_DATE - (2 * days_back || ' days')::interval)::date AND
      (CURRENT_DATE - (days_back || ' days')::interval)::date
    GROUP BY l.created_at::date
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

-- 2. Enhanced funnel analysis with bottlenecks
CREATE OR REPLACE FUNCTION public.get_funnel_analysis(days_back integer DEFAULT 30)
RETURNS TABLE(
  step_name text,
  step_order integer,
  total_entries bigint,
  conversions bigint,
  conversion_rate numeric,
  drop_off_rate numeric,
  bottleneck_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_visitors bigint;
  total_leads bigint;
  total_quiz_starts bigint;
  total_quiz_completions bigint;
  total_vsl_views bigint;
  total_bookings bigint;
BEGIN
  -- Get base metrics
  SELECT COUNT(*) INTO total_visitors
  FROM public.funnel_events
  WHERE event_type = 'lp_view' 
  AND created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*) INTO total_leads
  FROM public.leads
  WHERE created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*) INTO total_quiz_starts
  FROM public.funnel_events
  WHERE event_type = 'quiz_start'
  AND created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*) INTO total_quiz_completions
  FROM public.quiz_sessions
  WHERE status = 'completed'
  AND started_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*) INTO total_vsl_views
  FROM public.funnel_events
  WHERE event_type = 'vsl_view'
  AND created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*) INTO total_bookings
  FROM public.bookings
  WHERE created_at >= NOW() - (days_back || ' days')::interval;

  RETURN QUERY
  WITH funnel_steps AS (
    SELECT 'Visiteurs' as step_name, 1 as step_order, total_visitors as entries, total_leads as next_conversions
    UNION ALL
    SELECT 'Capture Lead', 2, total_leads, total_quiz_starts
    UNION ALL  
    SELECT 'Début Quiz', 3, total_quiz_starts, total_quiz_completions
    UNION ALL
    SELECT 'Quiz Terminé', 4, total_quiz_completions, total_vsl_views
    UNION ALL
    SELECT 'VSL Vue', 5, total_vsl_views, total_bookings
    UNION ALL
    SELECT 'Consultation', 6, total_bookings, total_bookings
  )
  SELECT 
    fs.step_name,
    fs.step_order,
    fs.entries::bigint as total_entries,
    fs.next_conversions::bigint as conversions,
    CASE WHEN fs.entries > 0 
      THEN ROUND((fs.next_conversions::numeric / fs.entries::numeric) * 100, 2)
      ELSE 0 
    END as conversion_rate,
    CASE WHEN fs.entries > 0
      THEN ROUND(((fs.entries - fs.next_conversions)::numeric / fs.entries::numeric) * 100, 2)
      ELSE 0
    END as drop_off_rate,
    CASE WHEN fs.entries > 0 AND fs.next_conversions::numeric / fs.entries::numeric < 0.3
      THEN 100 - ((fs.next_conversions::numeric / fs.entries::numeric) * 100)
      ELSE 0
    END as bottleneck_score
  FROM funnel_steps fs
  WHERE fs.step_order <= 5
  ORDER BY fs.step_order;
END;
$function$;

-- 3. Attribution analysis by source/medium/campaign
CREATE OR REPLACE FUNCTION public.get_attribution_analysis(days_back integer DEFAULT 30)
RETURNS TABLE(
  utm_source text,
  utm_medium text,
  utm_campaign text,
  visitors bigint,
  leads bigint,
  quiz_completions bigint,
  bookings bigint,
  conversion_rate numeric,
  cost_per_lead numeric,
  roi_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH attribution_data AS (
    SELECT 
      COALESCE(l.utm_source, 'direct') as source,
      COALESCE(l.utm_medium, 'organic') as medium,
      COALESCE(l.utm_campaign, 'none') as campaign,
      COUNT(DISTINCT fe.session_id) FILTER (WHERE fe.event_type = 'lp_view') as visitor_count,
      COUNT(DISTINCT l.id) as lead_count,
      COUNT(DISTINCT qs.id) FILTER (WHERE qs.status = 'completed') as quiz_count,
      COUNT(DISTINCT b.id) as booking_count
    FROM public.leads l
    LEFT JOIN public.funnel_events fe ON fe.lead_id = l.id
    LEFT JOIN public.quiz_sessions qs ON qs.lead_id = l.id
    LEFT JOIN public.bookings b ON b.lead_id = l.id
    WHERE l.created_at >= NOW() - (days_back || ' days')::interval
    GROUP BY l.utm_source, l.utm_medium, l.utm_campaign
  )
  SELECT 
    ad.source,
    ad.medium,
    ad.campaign,
    ad.visitor_count::bigint,
    ad.lead_count::bigint,
    ad.quiz_count::bigint,
    ad.booking_count::bigint,
    CASE WHEN ad.lead_count > 0
      THEN ROUND((ad.booking_count::numeric / ad.lead_count::numeric) * 100, 2)
      ELSE 0
    END as conversion_rate,
    0::numeric as cost_per_lead,
    CASE WHEN ad.lead_count > 0 AND ad.booking_count > 0
      THEN ROUND((ad.booking_count::numeric / ad.lead_count::numeric) * 100, 1)
      ELSE 0
    END as roi_score
  FROM attribution_data ad
  WHERE ad.lead_count > 0
  ORDER BY ad.booking_count DESC, ad.lead_count DESC;
END;
$function$;

-- 4. VSL engagement analysis
CREATE OR REPLACE FUNCTION public.get_vsl_engagement_analysis(days_back integer DEFAULT 30)
RETURNS TABLE(
  time_bucket text,
  play_events bigint,
  pause_events bigint,
  completion_events bigint,
  avg_watch_duration numeric,
  engagement_rate numeric,
  cta_clicks bigint,
  cta_conversion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH vsl_events AS (
    SELECT 
      fe.event_type,
      fe.event_data,
      fe.session_id,
      CASE 
        WHEN EXTRACT(hour FROM fe.created_at) BETWEEN 6 AND 11 THEN 'Matin (6h-11h)'
        WHEN EXTRACT(hour FROM fe.created_at) BETWEEN 12 AND 17 THEN 'Apres-midi (12h-17h)'  
        WHEN EXTRACT(hour FROM fe.created_at) BETWEEN 18 AND 22 THEN 'Soir (18h-22h)'
        ELSE 'Nuit (23h-5h)'
      END as time_period
    FROM public.funnel_events fe
    WHERE fe.event_type IN ('vsl_play', 'vsl_pause', 'vsl_complete', 'vsl_cta_click')
    AND fe.created_at >= NOW() - (days_back || ' days')::interval
  )
  SELECT 
    ve.time_period,
    COUNT(*) FILTER (WHERE ve.event_type = 'vsl_play')::bigint as play_events,
    COUNT(*) FILTER (WHERE ve.event_type = 'vsl_pause')::bigint as pause_events,
    COUNT(*) FILTER (WHERE ve.event_type = 'vsl_complete')::bigint as completion_events,
    AVG(COALESCE((ve.event_data->>'duration')::numeric, 0)) as avg_watch_duration,
    CASE WHEN COUNT(*) FILTER (WHERE ve.event_type = 'vsl_play') > 0
      THEN ROUND(
        (COUNT(*) FILTER (WHERE ve.event_type = 'vsl_complete')::numeric / 
         COUNT(*) FILTER (WHERE ve.event_type = 'vsl_play')::numeric) * 100, 2
      )
      ELSE 0
    END as engagement_rate,
    COUNT(*) FILTER (WHERE ve.event_type = 'vsl_cta_click')::bigint as cta_clicks,
    CASE WHEN COUNT(*) FILTER (WHERE ve.event_type = 'vsl_complete') > 0
      THEN ROUND(
        (COUNT(*) FILTER (WHERE ve.event_type = 'vsl_cta_click')::numeric /
         COUNT(*) FILTER (WHERE ve.event_type = 'vsl_complete')::numeric) * 100, 2
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

-- 5. Data quality and tracking health
CREATE OR REPLACE FUNCTION public.get_tracking_health_metrics(days_back integer DEFAULT 7)
RETURNS TABLE(
  metric_name text,
  metric_value numeric,
  status text,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_events bigint;
  invalid_sessions bigint;
  missing_utm bigint;
  duplicate_leads bigint;
  honeypot_detections bigint;
BEGIN
  SELECT COUNT(*) INTO total_events
  FROM public.funnel_events
  WHERE created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*) INTO invalid_sessions
  FROM public.funnel_events
  WHERE NOT validate_session_id(session_id)
  AND created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*) INTO missing_utm
  FROM public.leads
  WHERE utm_source IS NULL AND utm_medium IS NULL AND utm_campaign IS NULL
  AND created_at >= NOW() - (days_back || ' days')::interval;

  SELECT COUNT(*) INTO duplicate_leads
  FROM (
    SELECT email, COUNT(*) as cnt
    FROM public.leads
    WHERE created_at >= NOW() - (days_back || ' days')::interval
    GROUP BY email
    HAVING COUNT(*) > 1
  ) dups;

  honeypot_detections := 0;

  RETURN QUERY
  VALUES 
    ('Evenements Totaux', total_events::numeric, 
     CASE WHEN total_events > 100 THEN 'Bon' ELSE 'Faible' END,
     CASE WHEN total_events <= 100 THEN 'Augmenter le trafic' ELSE 'Bon volume' END),
    ('Sessions Invalides', 
     CASE WHEN total_events > 0 THEN ROUND((invalid_sessions::numeric / total_events::numeric) * 100, 2) ELSE 0 END,
     CASE WHEN invalid_sessions::numeric / NULLIF(total_events::numeric, 0) > 0.05 THEN 'Probleme' ELSE 'OK' END,
     CASE WHEN invalid_sessions::numeric / NULLIF(total_events::numeric, 0) > 0.05 THEN 'Verifier implementation' ELSE 'RAS' END),
    ('Leads sans UTM (%)', 
     CASE WHEN missing_utm > 0 THEN ROUND((missing_utm::numeric / (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - (days_back || ' days')::interval)::numeric) * 100, 2) ELSE 0 END,
     CASE WHEN missing_utm > 0 THEN 'Attention' ELSE 'OK' END,
     CASE WHEN missing_utm > 0 THEN 'Ajouter UTM tracking' ELSE 'Bon tracking' END),
    ('Leads Dupliques', duplicate_leads::numeric,
     CASE WHEN duplicate_leads > 0 THEN 'Attention' ELSE 'OK' END,
     CASE WHEN duplicate_leads > 0 THEN 'Nettoyer les doublons' ELSE 'Pas de doublons' END);
END;
$function$;