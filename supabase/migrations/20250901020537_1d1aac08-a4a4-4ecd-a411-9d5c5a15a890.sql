-- Étape 6: Corriger les politiques RLS trop permissives sur les tables existantes
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on email_events" ON public.email_events;
DROP POLICY IF EXISTS "Allow all operations on funnel_events" ON public.funnel_events;
DROP POLICY IF EXISTS "Allow all operations on quiz_sessions" ON public.quiz_sessions;
DROP POLICY IF EXISTS "Allow all operations on quiz_answers" ON public.quiz_answers;
DROP POLICY IF EXISTS "Allow all operations on email_sequence_triggers" ON public.email_sequence_triggers;

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

CREATE POLICY "No public read on leads" 
  ON public.leads 
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "No public update on leads" 
  ON public.leads 
  FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "No public delete on leads" 
  ON public.leads 
  FOR DELETE
  TO anon, authenticated
  USING (false);