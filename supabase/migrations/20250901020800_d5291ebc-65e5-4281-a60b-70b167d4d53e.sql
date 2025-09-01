-- Étape 7: Ajouter des contraintes de validation sur les tables critiques
DO $$ 
BEGIN
  -- Ajouter contrainte email uniquement si elle n'existe pas déjà
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'check_email_format' 
                 AND table_name = 'leads') THEN
    ALTER TABLE public.leads 
      ADD CONSTRAINT check_email_format 
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
  
  -- Ajouter contrainte nom uniquement si elle n'existe pas déjà
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'check_name_not_empty' 
                 AND table_name = 'leads') THEN
    ALTER TABLE public.leads 
      ADD CONSTRAINT check_name_not_empty 
      CHECK (trim(name) != '');
  END IF;
END $$;

-- Étape 8: Ajouter un trigger pour mettre à jour updated_at sur leads
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
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