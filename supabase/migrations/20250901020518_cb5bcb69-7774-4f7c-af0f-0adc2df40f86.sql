-- Étape 1: Ajouter les types d'événements manquants à l'enum
ALTER TYPE funnel_event_type ADD VALUE IF NOT EXISTS 'performance_metric';
ALTER TYPE funnel_event_type ADD VALUE IF NOT EXISTS 'guarantee_view';
ALTER TYPE funnel_event_type ADD VALUE IF NOT EXISTS 'guarantee_cta_click';

-- Étape 2: Créer une table pour les événements d'email avec contraintes appropriées
CREATE TABLE IF NOT EXISTS public.email_delivery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
  provider_response JSONB,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Étape 3: Indexer pour les requêtes de performance
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_lead_id ON public.email_delivery_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_status ON public.email_delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_sent_at ON public.email_delivery_logs(sent_at);

-- Étape 4: Activer RLS sur la nouvelle table
ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Étape 5: Créer des politiques RLS sécurisées pour la nouvelle table
CREATE POLICY "Service role can manage email logs" 
  ON public.email_delivery_logs 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "No public access to email logs" 
  ON public.email_delivery_logs 
  FOR ALL 
  TO anon, authenticated
  USING (false);