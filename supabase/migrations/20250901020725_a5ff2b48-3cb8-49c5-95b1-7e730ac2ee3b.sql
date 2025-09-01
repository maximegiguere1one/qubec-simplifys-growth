-- Étape 7: Ajouter des contraintes de validation sur les tables critiques
ALTER TABLE public.leads 
  ADD CONSTRAINT IF NOT EXISTS check_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.leads 
  ADD CONSTRAINT IF NOT EXISTS check_name_not_empty 
  CHECK (trim(name) != '');

-- Étape 8: Ajouter un trigger pour mettre à jour updated_at sur leads
CREATE OR REPLACE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Étape 9: Créer une fonction pour nettoyer les événements anciens (performance)
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
  
  -- Log de la maintenance
  RAISE NOTICE 'Cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Étape 10: Créer une fonction pour vérifier la santé de l'email
CREATE OR REPLACE FUNCTION public.get_email_delivery_stats(days_back integer DEFAULT 7)
RETURNS TABLE (
  total_sent bigint,
  total_failed bigint,
  success_rate numeric,
  last_successful_send timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE status = 'sent')::bigint as total_sent,
    COUNT(*) FILTER (WHERE status = 'failed')::bigint as total_failed,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'sent')::numeric / NULLIF(COUNT(*)::numeric, 0)) * 100, 
      2
    ) as success_rate,
    MAX(sent_at) FILTER (WHERE status = 'sent') as last_successful_send
  FROM public.email_delivery_logs
  WHERE sent_at >= NOW() - (days_back || ' days')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;