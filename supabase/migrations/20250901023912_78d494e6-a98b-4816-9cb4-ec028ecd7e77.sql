-- Create email queue table for managing email sending
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email unsubscribes table for GDPR compliance
CREATE TABLE public.email_unsubscribes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  lead_id UUID REFERENCES public.leads(id),
  unsubscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_queue
CREATE POLICY "Service role can manage email queue" 
ON public.email_queue 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "No public access to email queue" 
ON public.email_queue 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- RLS Policies for email_unsubscribes
CREATE POLICY "Service role can manage unsubscribes" 
ON public.email_unsubscribes 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Anonymous can insert unsubscribes" 
ON public.email_unsubscribes 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "No public read on unsubscribes" 
ON public.email_unsubscribes 
FOR SELECT 
TO anon 
USING (false);

-- Add updated_at trigger
CREATE TRIGGER update_email_queue_updated_at
BEFORE UPDATE ON public.email_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_email_queue_status_scheduled ON public.email_queue(status, scheduled_for);
CREATE INDEX idx_email_queue_lead_id ON public.email_queue(lead_id);
CREATE INDEX idx_email_unsubscribes_email ON public.email_unsubscribes(email);