-- Add missing columns to leads table for lead scoring
ALTER TABLE public.leads 
ADD COLUMN score INTEGER DEFAULT 0,
ADD COLUMN segment TEXT DEFAULT 'cold' CHECK (segment IN ('cold', 'warm', 'hot', 'qualified')),
ADD COLUMN industry TEXT,
ADD COLUMN location TEXT,
ADD COLUMN business_size TEXT,
ADD COLUMN scoring_data JSONB DEFAULT '{}';

-- Create email events tracking table
CREATE TABLE public.email_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id),
    email_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('sent', 'opened', 'clicked', 'unsubscribed')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email sequence triggers table
CREATE TABLE public.email_sequence_triggers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id),
    sequence_id TEXT NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_triggers ENABLE ROW LEVEL SECURITY;

-- Create policies for email events
CREATE POLICY "Allow all operations on email_events" 
ON public.email_events 
FOR ALL 
USING (true);

-- Create policies for email sequence triggers
CREATE POLICY "Allow all operations on email_sequence_triggers" 
ON public.email_sequence_triggers 
FOR ALL 
USING (true);

-- Add indexes for performance
CREATE INDEX idx_leads_segment ON public.leads(segment);
CREATE INDEX idx_leads_score ON public.leads(score);
CREATE INDEX idx_email_events_lead_id ON public.email_events(lead_id);
CREATE INDEX idx_email_events_action ON public.email_events(action);
CREATE INDEX idx_email_sequence_triggers_lead_id ON public.email_sequence_triggers(lead_id);