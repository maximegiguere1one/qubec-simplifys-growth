
-- Fonction qui enfile un email de notification admin à chaque nouveau lead
CREATE OR REPLACE FUNCTION public.enqueue_admin_lead_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_subject text;
  v_html text;
BEGIN
  -- Sujet lisible en boîte de réception
  v_subject := format('Nouveau lead: %s <%s>', COALESCE(NEW.name, 'Inconnu'), NEW.email);

  -- Corps HTML avec informations utiles
  v_html := format(
    '<h2>Nouveau lead reçu</h2>
     <p><strong>Nom:</strong> %s</p>
     <p><strong>Email:</strong> %s</p>
     %s
     %s
     <p><strong>Source:</strong> %s</p>
     %s
     %s
     <p><strong>Segment:</strong> %s</p>
     <p><strong>Score:</strong> %s</p>
     <p><strong>Reçu le:</strong> %s</p>',
     COALESCE(NEW.name,''),
     COALESCE(NEW.email,''),
     CASE WHEN NEW.phone IS NOT NULL THEN format('<p><strong>Téléphone:</strong> %s</p>', NEW.phone) ELSE '' END,
     CASE WHEN NEW.company IS NOT NULL THEN format('<p><strong>Entreprise:</strong> %s</p>', NEW.company) ELSE '' END,
     COALESCE(NEW.source,''),
     CASE WHEN NEW.utm_source IS NOT NULL THEN format('<p><strong>UTM source:</strong> %s</p>', NEW.utm_source) ELSE '' END,
     CASE WHEN NEW.utm_campaign IS NOT NULL THEN format('<p><strong>UTM campaign:</strong> %s</p>', NEW.utm_campaign) ELSE '' END,
     COALESCE(NEW.segment,''),
     COALESCE(NEW.score::text,'0'),
     to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS TZ')
  );

  INSERT INTO public.email_queue (
    lead_id,
    recipient_email,
    subject,
    html_content,
    email_type,
    scheduled_for,
    status,
    attempts,
    max_attempts
  ) VALUES (
    NEW.id,
    'maxime@giguere-influence.com',
    v_subject,
    v_html,
    'lead_notification',
    NOW(),
    'pending',
    0,
    5
  );

  RETURN NEW;
END;
$$;

-- Trigger: après insertion d'un lead, enfile la notification
DROP TRIGGER IF EXISTS trg_enqueue_admin_lead_notification ON public.leads;

CREATE TRIGGER trg_enqueue_admin_lead_notification
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_admin_lead_notification();
