-- Create table for tracking conversion events sent to Facebook
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  facebook_event_name TEXT NOT NULL,
  event_data JSONB,
  lead_id UUID,
  session_id TEXT,
  facebook_response JSONB,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_conversion_events_lead_id ON public.conversion_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id ON public.conversion_events(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON public.conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_sent_at ON public.conversion_events(sent_at);