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

-- Nouvelles politiques RLS sécurisées pour email_sequence_triggers
CREATE POLICY "Service role can manage email sequence triggers" 
  ON public.email_sequence_triggers 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can create email sequence triggers" 
  ON public.email_sequence_triggers 
  FOR INSERT 
  TO anon
  WITH CHECK (true);