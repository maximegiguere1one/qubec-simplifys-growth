-- Cron job setup for automated email processing
-- This will run the process-email-queue function every 5 minutes

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the email queue processing every 5 minutes
SELECT cron.schedule(
  'process-email-queue-every-5-min',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://lbwjesrgernvjiorktia.supabase.co/functions/v1/process-email-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2plc3JnZXJudmppb3JrdGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUzNjI3MywiZXhwIjoyMDcyMTEyMjczfQ.U7kEIQKjUJWsULnfSKNOQqZNC1aEF9MJODwkPLjdCFg"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Also create a daily cleanup job at 2 AM
SELECT cron.schedule(
  'cleanup-old-email-events',
  '0 2 * * *', -- Daily at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://lbwjesrgernvjiorktia.supabase.co/functions/v1/process-email-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2plc3JnZXJudmppb3JrdGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUzNjI3MywiZXhwIjoyMDcyMTEyMjczfQ.U7kEIQKjUJWsULnfSKNOQqZNC1aEF9MJODwkPLjdCFg"}'::jsonb,
        body:=concat('{"cleanup": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Add enhanced email settings columns
ALTER TABLE public.email_settings 
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00',
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Toronto',
ADD COLUMN IF NOT EXISTS bounce_handling_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS open_tracking_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS click_tracking_enabled BOOLEAN DEFAULT true;