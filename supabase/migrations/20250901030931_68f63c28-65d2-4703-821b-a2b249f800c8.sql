-- Schedule process-email-queue to run every 5 minutes
SELECT cron.schedule(
  'process-email-queue',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://lbwjesrgernvjiorktia.supabase.co/functions/v1/process-email-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2plc3JnZXJudmppb3JrdGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUzNjI3MywiZXhwIjoyMDcyMTEyMjczfQ.Tg0Y_ZULp8qHpL6DFxZ_tHE1TbwK5K3qsA7Q1w0dJrI"}'::jsonb,
        body:=concat('{"scheduled": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Fix quiz_answers RLS policy for correct score range (0-40 instead of 0-10)
DROP POLICY IF EXISTS "Validated quiz answers only" ON public.quiz_answers;

CREATE POLICY "Validated quiz answers only" 
ON public.quiz_answers 
FOR INSERT 
WITH CHECK (
  (question_id >= 1 AND question_id <= 20) AND
  (answer_score >= 0 AND answer_score <= 40) AND -- Updated score range for new quiz
  (length(TRIM(BOTH FROM answer_value)) >= 1) AND
  (length(answer_value) <= 500) AND
  (time_spent_seconds IS NULL OR (time_spent_seconds >= 1 AND time_spent_seconds <= 600))
);