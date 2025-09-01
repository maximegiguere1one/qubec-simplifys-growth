-- Add RLS policy for conversion_events table (admin access only)
CREATE POLICY "Admin access to conversion_events" 
ON public.conversion_events 
FOR ALL 
USING (false);

-- Add insert policy for service role (edge functions)
CREATE POLICY "Service role can insert conversion_events" 
ON public.conversion_events 
FOR INSERT 
WITH CHECK (true);