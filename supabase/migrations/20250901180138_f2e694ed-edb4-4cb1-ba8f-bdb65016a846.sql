
-- 1) Ajouter la colonne "company" à public.leads (si absente)
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS company text;

-- 2) Backfill depuis bookings (si des réservations existent avec company)
UPDATE public.leads l
SET company = b.company
FROM public.bookings b
WHERE b.lead_id = l.id
  AND l.company IS NULL
  AND b.company IS NOT NULL;

-- 3) Index pour accélérer les filtres et le tri utilisés par l'admin
CREATE INDEX IF NOT EXISTS idx_leads_segment_source_created_at
  ON public.leads (segment, source, created_at DESC);
