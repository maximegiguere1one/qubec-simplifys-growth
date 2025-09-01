
BEGIN;

WITH
  target_email AS (
    SELECT lower('maxime@giguere-influence.com') AS email
  ),
  target_leads AS (
    SELECT id
    FROM public.leads
    WHERE lower(email) = (SELECT email FROM target_email)
  ),
  target_sessions AS (
    SELECT DISTINCT session_id
    FROM public.quiz_sessions
    WHERE lead_id IN (SELECT id FROM target_leads)

    UNION
    SELECT DISTINCT session_id
    FROM public.funnel_events
    WHERE lead_id IN (SELECT id FROM target_leads)

    UNION
    SELECT DISTINCT session_id
    FROM public.bookings
    WHERE lower(email) = (SELECT email FROM target_email)
       OR lead_id IN (SELECT id FROM target_leads)

    UNION
    SELECT DISTINCT (event_data->>'session_id') AS session_id
    FROM public.conversion_events
    WHERE lead_id IN (SELECT id FROM target_leads)
      AND (event_data->>'session_id') IS NOT NULL
  ),

  del_quiz_answers AS (
    DELETE FROM public.quiz_answers qa
    USING public.quiz_sessions qs
    WHERE qa.quiz_session_id = qs.id
      AND qs.lead_id IN (SELECT id FROM target_leads)
    RETURNING qa.id
  ),
  del_quiz_sessions AS (
    DELETE FROM public.quiz_sessions
    WHERE lead_id IN (SELECT id FROM target_leads)
       OR session_id IN (SELECT session_id FROM target_sessions)
    RETURNING id
  ),
  del_bookings AS (
    DELETE FROM public.bookings
    WHERE lead_id IN (SELECT id FROM target_leads)
       OR lower(email) = (SELECT email FROM target_email)
       OR session_id IN (SELECT session_id FROM target_sessions)
    RETURNING id
  ),
  del_conversion_events AS (
    DELETE FROM public.conversion_events
    WHERE lead_id IN (SELECT id FROM target_leads)
       OR session_id IN (SELECT session_id FROM target_sessions)
    RETURNING id
  ),
  del_email_queue AS (
    DELETE FROM public.email_queue
    WHERE lead_id IN (SELECT id FROM target_leads)
       OR lower(recipient_email) = (SELECT email FROM target_email)
    RETURNING id
  ),
  del_email_delivery_logs AS (
    DELETE FROM public.email_delivery_logs
    WHERE lead_id IN (SELECT id FROM target_leads)
       OR lower(recipient_email) = (SELECT email FROM target_email)
    RETURNING id
  ),
  del_email_unsubscribes AS (
    DELETE FROM public.email_unsubscribes
    WHERE lead_id IN (SELECT id FROM target_leads)
       OR lower(email) = (SELECT email FROM target_email)
    RETURNING id
  ),
  del_email_events AS (
    DELETE FROM public.email_events
    WHERE lead_id IN (SELECT id FROM target_leads)
    RETURNING id
  ),
  del_email_seq_triggers AS (
    DELETE FROM public.email_sequence_triggers
    WHERE lead_id IN (SELECT id FROM target_leads)
    RETURNING id
  ),
  del_lead_notes AS (
    DELETE FROM public.lead_notes
    WHERE lead_id IN (SELECT id FROM target_leads)
    RETURNING id
  ),
  del_lead_tasks AS (
    DELETE FROM public.lead_tasks
    WHERE lead_id IN (SELECT id FROM target_leads)
    RETURNING id
  ),
  del_lead_tag_assignments AS (
    DELETE FROM public.lead_tag_assignments
    WHERE lead_id IN (SELECT id FROM target_leads)
    RETURNING id
  ),
  del_funnel_events_by_lead AS (
    DELETE FROM public.funnel_events
    WHERE lead_id IN (SELECT id FROM target_leads)
    RETURNING id
  ),
  del_funnel_events_by_session AS (
    DELETE FROM public.funnel_events fe
    WHERE fe.lead_id IS NULL
      AND fe.session_id IN (SELECT session_id FROM target_sessions)
    RETURNING id
  ),
  del_leads AS (
    DELETE FROM public.leads
    WHERE id IN (SELECT id FROM target_leads)
    RETURNING id
  )
SELECT
  (SELECT COUNT(*) FROM target_leads) AS leads_found,
  (SELECT COUNT(*) FROM del_quiz_answers) AS quiz_answers_deleted,
  (SELECT COUNT(*) FROM del_quiz_sessions) AS quiz_sessions_deleted,
  (SELECT COUNT(*) FROM del_bookings) AS bookings_deleted,
  (SELECT COUNT(*) FROM del_conversion_events) AS conversion_events_deleted,
  (SELECT COUNT(*) FROM del_email_queue) AS email_queue_deleted,
  (SELECT COUNT(*) FROM del_email_delivery_logs) AS email_delivery_logs_deleted,
  (SELECT COUNT(*) FROM del_email_unsubscribes) AS email_unsubscribes_deleted,
  (SELECT COUNT(*) FROM del_email_events) AS email_events_deleted,
  (SELECT COUNT(*) FROM del_email_seq_triggers) AS email_sequence_triggers_deleted,
  (SELECT COUNT(*) FROM del_lead_notes) AS lead_notes_deleted,
  (SELECT COUNT(*) FROM del_lead_tasks) AS lead_tasks_deleted,
  (SELECT COUNT(*) FROM del_lead_tag_assignments) AS lead_tag_assignments_deleted,
  (SELECT COUNT(*) FROM del_funnel_events_by_lead) AS funnel_events_by_lead_deleted,
  (SELECT COUNT(*) FROM del_funnel_events_by_session) AS funnel_events_by_session_deleted,
  (SELECT COUNT(*) FROM del_leads) AS leads_deleted;

COMMIT;
