-- Corriger l'avertissement de sécurité pour la fonction
CREATE OR REPLACE FUNCTION public.cleanup_old_events()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Créer une fonction pour vérifier la santé de l'email
CREATE OR REPLACE FUNCTION public.get_email_delivery_stats(days_back integer DEFAULT 7)
RETURNS TABLE (
  total_sent bigint,
  total_failed bigint,
  success_rate numeric,
  last_successful_send timestamp with time zone
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;