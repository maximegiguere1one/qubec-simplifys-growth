-- Corriger les fonctions SQL pour utiliser les vraies données disponibles

-- Fonction corrigée pour les métriques du dashboard
CREATE OR REPLACE FUNCTION public.get_real_dashboard_metrics(days_back integer DEFAULT 30)
 RETURNS TABLE(
   total_leads bigint, 
   quiz_completions bigint, 
   vsl_views bigint, 
   bookings bigint, 
   conversion_rate numeric, 
   avg_quiz_score numeric
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH lead_data AS (
    SELECT 
      COUNT(*)::bigint AS lead_count,
      AVG(score)::numeric AS avg_score
    FROM public.leads
    WHERE created_at >= NOW() - (days_back || ' days')::interval
  ),
  quiz_data AS (
    SELECT COUNT(*)::bigint AS quiz_count
    FROM public.quiz_sessions
    WHERE status = 'completed'
      AND started_at >= NOW() - (days_back || ' days')::interval
  ),
  vsl_data AS (
    SELECT COUNT(*)::bigint AS vsl_count
    FROM public.funnel_events
    WHERE event_type = 'vsl_view'
      AND created_at >= NOW() - (days_back || ' days')::interval
  ),
  booking_data AS (
    SELECT COUNT(*)::bigint AS booking_count
    FROM public.bookings
    WHERE created_at >= NOW() - (days_back || ' days')::interval
  )
  SELECT
    l.lead_count,
    q.quiz_count,
    v.vsl_count,
    b.booking_count,
    CASE WHEN l.lead_count > 0 
      THEN ROUND((b.booking_count::numeric / l.lead_count::numeric) * 100, 2)
      ELSE 0 
    END,
    COALESCE(ROUND(l.avg_score, 2), 0)
  FROM lead_data l, quiz_data q, vsl_data v, booking_data b;
END;
$$;

-- Fonction pour analyser les données réelles disponibles
CREATE OR REPLACE FUNCTION public.get_real_leads_analysis(days_back integer DEFAULT 30)
 RETURNS TABLE(
   date_bucket date,
   total_leads bigint,
   avg_score numeric,
   hot_leads bigint,
   warm_leads bigint,
   cold_leads bigint,
   utm_facebook bigint,
   utm_instagram bigint,
   utm_direct bigint
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      (CURRENT_DATE - (days_back || ' days')::interval)::date,
      CURRENT_DATE,
      '1 day'::interval
    )::date as date_bucket
  )
  SELECT 
    ds.date_bucket,
    COUNT(l.id)::bigint as total_leads,
    AVG(l.score)::numeric as avg_score,
    COUNT(l.id) FILTER (WHERE l.segment = 'hot')::bigint as hot_leads,
    COUNT(l.id) FILTER (WHERE l.segment = 'warm')::bigint as warm_leads,
    COUNT(l.id) FILTER (WHERE l.segment = 'cold')::bigint as cold_leads,
    COUNT(l.id) FILTER (WHERE l.utm_source = 'fb')::bigint as utm_facebook,
    COUNT(l.id) FILTER (WHERE l.utm_source = 'ig')::bigint as utm_instagram,
    COUNT(l.id) FILTER (WHERE l.utm_source IS NULL OR l.utm_source = 'direct')::bigint as utm_direct
  FROM date_series ds
  LEFT JOIN public.leads l ON l.created_at::date = ds.date_bucket
  GROUP BY ds.date_bucket
  ORDER BY ds.date_bucket;
END;
$$;

-- Fonction pour les insights de qualité des leads  
CREATE OR REPLACE FUNCTION public.get_lead_quality_insights()
 RETURNS TABLE(
   total_leads bigint,
   avg_score numeric,
   segment_distribution jsonb,
   source_performance jsonb,
   recent_activity text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  total_count bigint;
  avg_lead_score numeric;
  segments jsonb;
  sources jsonb;
  latest_activity text;
BEGIN
  -- Total leads et score moyen
  SELECT COUNT(*), AVG(score) 
  INTO total_count, avg_lead_score
  FROM public.leads;

  -- Distribution par segment
  SELECT jsonb_object_agg(segment, count)
  INTO segments
  FROM (
    SELECT segment, COUNT(*) as count
    FROM public.leads
    WHERE segment IS NOT NULL
    GROUP BY segment
  ) seg_counts;

  -- Performance par source
  SELECT jsonb_object_agg(
    COALESCE(utm_source, 'direct'), 
    jsonb_build_object(
      'count', count,
      'avg_score', avg_score
    )
  )
  INTO sources
  FROM (
    SELECT 
      utm_source,
      COUNT(*) as count,
      ROUND(AVG(score), 1) as avg_score
    FROM public.leads
    GROUP BY utm_source
  ) source_stats;

  -- Dernière activité
  SELECT 'Dernier lead: ' || name || ' (' || email || ') - Score: ' || score
  INTO latest_activity
  FROM public.leads
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN QUERY
  SELECT 
    total_count,
    ROUND(avg_lead_score, 1),
    COALESCE(segments, '{}'::jsonb),
    COALESCE(sources, '{}'::jsonb),
    COALESCE(latest_activity, 'Aucune activité récente');
END;
$$;