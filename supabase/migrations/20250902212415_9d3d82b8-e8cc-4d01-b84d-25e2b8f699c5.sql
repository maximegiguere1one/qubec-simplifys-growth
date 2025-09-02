-- Add queue_id to email_delivery_logs to link with email_events
ALTER TABLE public.email_delivery_logs 
ADD COLUMN queue_id uuid NULL;

-- Add event_data to email_events for storing click details, user agents, etc.
ALTER TABLE public.email_events 
ADD COLUMN event_data jsonb NOT NULL DEFAULT '{}';

-- Add only the new indexes we need (some already exist)
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_queue_id ON public.email_delivery_logs(queue_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_status ON public.email_delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_email_type ON public.email_delivery_logs(email_type);

CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON public.email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON public.email_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON public.email_queue(scheduled_for);