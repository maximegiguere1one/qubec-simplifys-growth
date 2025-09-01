-- Fix critical security vulnerability in bookings table RLS policies
-- Remove the overly permissive policy that allows public access to customer data

-- Drop the existing dangerous policy
DROP POLICY IF EXISTS "Allow all operations on bookings" ON public.bookings;

-- Create secure policies that protect customer data while maintaining functionality

-- Policy 1: Allow anonymous users to INSERT bookings only (for booking form submission)
CREATE POLICY "Anonymous users can create bookings" 
ON public.bookings
FOR INSERT 
TO anon
WITH CHECK (true);

-- Policy 2: Allow service role full access (for admin operations and edge functions)
CREATE POLICY "Service role full access to bookings" 
ON public.bookings
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 3: Authenticated users cannot access other users' booking data
-- (This is for future auth implementation - currently restrictive)
CREATE POLICY "No public read access to bookings" 
ON public.bookings
FOR SELECT 
TO anon, authenticated
USING (false);

-- Policy 4: No public update/delete access
CREATE POLICY "No public update access to bookings" 
ON public.bookings
FOR UPDATE 
TO anon, authenticated
USING (false);

CREATE POLICY "No public delete access to bookings" 
ON public.bookings
FOR DELETE 
TO anon, authenticated
USING (false);

-- Add comment explaining the security model
COMMENT ON TABLE public.bookings IS 'Customer booking data - protected by RLS. Only service role has read access to protect customer privacy. Anonymous users can only insert new bookings.';