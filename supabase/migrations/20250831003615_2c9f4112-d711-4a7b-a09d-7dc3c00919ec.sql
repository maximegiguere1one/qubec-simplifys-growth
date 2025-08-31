-- Add phone column to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS phone TEXT;