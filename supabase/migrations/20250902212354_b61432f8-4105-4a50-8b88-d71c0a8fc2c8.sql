-- Add queue_id to email_delivery_logs to link with email_events
ALTER TABLE public.email_delivery_logs 
ADD COLUMN queue_id uuid NULL;

-- Add index for performance
CREATE INDEX idx_email_delivery_logs_queue_id ON public.email_delivery_logs(queue_id);
CREATE INDEX idx_email_delivery_logs_sent_at ON public.email_delivery_logs(sent_at);
CREATE INDEX idx_email_delivery_logs_status ON public.email_delivery_logs(status);
CREATE INDEX idx_email_delivery_logs_email_type ON public.email_delivery_logs(email_type);

-- Add event_data to email_events for storing click details, user agents, etc.
ALTER TABLE public.email_events 
ADD COLUMN event_data jsonb NOT NULL DEFAULT '{}';

-- Add index for email_events performance
CREATE INDEX idx_email_events_email_id ON public.email_events(email_id);
CREATE INDEX idx_email_events_timestamp ON public.email_events(timestamp);

-- Add index for email_queue performance
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_scheduled_for ON public.email_queue(scheduled_for);

-- Create function to get enhanced email analytics
CREATE OR REPLACE FUNCTION public.get_email_analytics_enhanced(
  page_num integer DEFAULT 1,
  page_limit integer DEFAULT 50,
  filter_status text DEFAULT NULL,
  filter_email_type text DEFAULT NULL,
  filter_search text DEFAULT NULL,
  filter_from timestamptz DEFAULT NULL,
  filter_to timestamptz DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  queue_id uuid,
  recipient_email text,
  subject text,
  email_type text,
  status text,
  sent_at timestamptz,
  error_message text,
  provider_response jsonb,
  lead_id uuid,
  lead_name text,
  lead_company text,
  open_count bigint,
  click_count bigint,
  first_opened_at timestamptz,
  last_clicked_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  offset_val integer;
BEGIN
  offset_val := (page_num - 1) * page_limit;
  
  RETURN QUERY
  WITH filtered_logs AS (
    SELECT 
      edl.*,
      l.name as lead_name,
      l.company as lead_company
    FROM public.email_delivery_logs edl
    LEFT JOIN public.leads l ON l.id = edl.lead_id
    WHERE 
      (filter_status IS NULL OR edl.status = filter_status)
      AND (filter_email_type IS NULL OR edl.email_type = filter_email_type)
      AND (filter_search IS NULL OR 
           edl.recipient_email ILIKE '%' || filter_search || '%' OR 
           edl.subject ILIKE '%' || filter_search || '%')
      AND (filter_from IS NULL OR edl.sent_at >= filter_from)
      AND (filter_to IS NULL OR edl.sent_at <= filter_to)
    ORDER BY edl.sent_at DESC
    LIMIT page_limit
    OFFSET offset_val
  ),
  event_stats AS (
    SELECT 
      ee.email_id,
      COUNT(*) FILTER (WHERE ee.action = 'opened') as open_count,
      COUNT(*) FILTER (WHERE ee.action = 'clicked') as click_count,
      MIN(ee.timestamp) FILTER (WHERE ee.action = 'opened') as first_opened_at,
      MAX(ee.timestamp) FILTER (WHERE ee.action = 'clicked') as last_clicked_at
    FROM public.email_events ee
    WHERE ee.email_id IN (SELECT fl.queue_id::text FROM filtered_logs fl WHERE fl.queue_id IS NOT NULL)
    GROUP BY ee.email_id
  ),
  total_count_cte AS (
    SELECT COUNT(*) as total
    FROM public.email_delivery_logs edl
    WHERE 
      (filter_status IS NULL OR edl.status = filter_status)
      AND (filter_email_type IS NULL OR edl.email_type = filter_email_type)
      AND (filter_search IS NULL OR 
           edl.recipient_email ILIKE '%' || filter_search || '%' OR 
           edl.subject ILIKE '%' || filter_search || '%')
      AND (filter_from IS NULL OR edl.sent_at >= filter_from)
      AND (filter_to IS NULL OR edl.sent_at <= filter_to)
  )
  SELECT 
    fl.id,
    fl.queue_id,
    fl.recipient_email,
    fl.subject,
    fl.email_type,
    fl.status,
    fl.sent_at,
    fl.error_message,
    fl.provider_response,
    fl.lead_id,
    fl.lead_name,
    fl.lead_company,
    COALESCE(es.open_count, 0)::bigint,
    COALESCE(es.click_count, 0)::bigint,
    es.first_opened_at,
    es.last_clicked_at,
    tc.total::bigint
  FROM filtered_logs fl
  LEFT JOIN event_stats es ON es.email_id = fl.queue_id::text
  CROSS JOIN total_count_cte tc;
END;
$$;

-- Create function to get email content by queue_id
CREATE OR REPLACE FUNCTION public.get_email_content_by_queue_id(queue_id_param uuid)
RETURNS TABLE(
  html_content text,
  subject text,
  email_type text,
  recipient_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eq.html_content,
    eq.subject,
    eq.email_type,
    eq.recipient_email
  FROM public.email_queue eq
  WHERE eq.id = queue_id_param;
END;
$$;

-- Create function to get email statistics
CREATE OR REPLACE FUNCTION public.get_email_stats_dashboard(days_back integer DEFAULT 30)
RETURNS TABLE(
  total_sent bigint,
  total_failed bigint,
  total_opened bigint,
  total_clicked bigint,
  open_rate numeric,
  click_rate numeric,
  bounce_rate numeric,
  daily_stats jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
      COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
      COUNT(*) as total_count
    FROM public.email_delivery_logs
    WHERE sent_at >= NOW() - (days_back || ' days')::interval
  ),
  event_stats AS (
    SELECT 
      COUNT(DISTINCT email_id) FILTER (WHERE action = 'opened') as opened_count,
      COUNT(DISTINCT email_id) FILTER (WHERE action = 'clicked') as clicked_count
    FROM public.email_events
    WHERE timestamp >= NOW() - (days_back || ' days')::interval
  ),
  daily_data AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'date', date_bucket,
          'sent', sent_count,
          'opened', opened_count,
          'clicked', clicked_count,
          'failed', failed_count
        ) ORDER BY date_bucket
      ) as daily_chart
    FROM (
      SELECT 
        DATE(edl.sent_at) as date_bucket,
        COUNT(*) FILTER (WHERE edl.status = 'sent') as sent_count,
        COUNT(*) FILTER (WHERE edl.status = 'failed') as failed_count,
        COUNT(DISTINCT ee.email_id) FILTER (WHERE ee.action = 'opened') as opened_count,
        COUNT(DISTINCT ee.email_id) FILTER (WHERE ee.action = 'clicked') as clicked_count
      FROM public.email_delivery_logs edl
      LEFT JOIN public.email_events ee ON ee.email_id = edl.queue_id::text 
        AND ee.timestamp::date = edl.sent_at::date
      WHERE edl.sent_at >= NOW() - (days_back || ' days')::interval
      GROUP BY DATE(edl.sent_at)
      ORDER BY DATE(edl.sent_at)
    ) daily_rollup
  )
  SELECT 
    s.sent_count::bigint,
    s.failed_count::bigint,
    es.opened_count::bigint,
    es.clicked_count::bigint,
    CASE WHEN s.sent_count > 0 
      THEN ROUND((es.opened_count::numeric / s.sent_count::numeric) * 100, 2)
      ELSE 0 
    END as open_rate,
    CASE WHEN s.sent_count > 0 
      THEN ROUND((es.clicked_count::numeric / s.sent_count::numeric) * 100, 2)
      ELSE 0 
    END as click_rate,
    CASE WHEN s.total_count > 0 
      THEN ROUND((s.failed_count::numeric / s.total_count::numeric) * 100, 2)
      ELSE 0 
    END as bounce_rate,
    dd.daily_chart
  FROM stats s, event_stats es, daily_data dd;
END;
$$;