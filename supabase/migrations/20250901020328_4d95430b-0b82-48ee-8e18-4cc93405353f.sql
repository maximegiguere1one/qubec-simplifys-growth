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

-- Étape 5: Créer des politiques RLS sécurisées
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

-- Étape 6: Corriger les politiques RLS trop permissives sur les tables existantes
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on email_events" ON public.email_events;
DROP POLICY IF EXISTS "Allow all operations on funnel_events" ON public.funnel_events;
DROP POLICY IF EXISTS "Allow all operations on quiz_sessions" ON public.quiz_sessions;
DROP POLICY IF EXISTS "Allow all operations on quiz_answers" ON public.quiz_answers;

-- Nouvelles politiques RLS sécurisées pour leads
CREATE POLICY "Service role can manage leads" 
  ON public.leads 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can create leads" 
  ON public.leads 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "No public read/update/delete on leads" 
  ON public.leads 
  FOR SELECT, UPDATE, DELETE
  TO anon, authenticated
  USING (false);

-- Nouvelles politiques RLS sécurisées pour email_events
CREATE POLICY "Service role can manage email events" 
  ON public.email_events 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can create email events" 
  ON public.email_events 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "No public read/update/delete on email events" 
  ON public.email_events 
  FOR SELECT, UPDATE, DELETE
  TO anon, authenticated
  USING (false);

-- Nouvelles politiques RLS sécurisées pour funnel_events
CREATE POLICY "Service role can manage funnel events" 
  ON public.funnel_events 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can create funnel events" 
  ON public.funnel_events 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "No public read/update/delete on funnel events" 
  ON public.funnel_events 
  FOR SELECT, UPDATE, DELETE
  TO anon, authenticated
  USING (false);

-- Nouvelles politiques RLS sécurisées pour quiz_sessions
CREATE POLICY "Service role can manage quiz sessions" 
  ON public.quiz_sessions 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can create quiz sessions" 
  ON public.quiz_sessions 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "No public read/update/delete on quiz sessions" 
  ON public.quiz_sessions 
  FOR SELECT, UPDATE, DELETE
  TO anon, authenticated
  USING (false);

-- Nouvelles politiques RLS sécurisées pour quiz_answers
CREATE POLICY "Service role can manage quiz answers" 
  ON public.quiz_answers 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can create quiz answers" 
  ON public.quiz_answers 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "No public read/update/delete on quiz answers" 
  ON public.quiz_answers 
  FOR SELECT, UPDATE, DELETE
  TO anon, authenticated
  USING (false);

-- Étape 7: Ajouter des contraintes de validation sur les tables critiques
ALTER TABLE public.leads 
  ADD CONSTRAINT check_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.leads 
  ADD CONSTRAINT check_name_not_empty 
  CHECK (trim(name) != '');

-- Étape 8: Créer une fonction pour nettoyer les événements anciens (performance)
CREATE OR REPLACE FUNCTION public.cleanup_old_events()
RETURNS void AS $$
BEGIN
  -- Supprimer les événements funnel de plus de 90 jours
  DELETE FROM public.funnel_events 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Supprimer les événements email de plus de 1 an
  DELETE FROM public.email_events 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Supprimer les logs de livraison email de plus de 6 mois
  DELETE FROM public.email_delivery_logs 
  WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;