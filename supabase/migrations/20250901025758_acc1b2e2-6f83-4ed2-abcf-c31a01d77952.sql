-- Fix security warnings by adding search_path to functions
CREATE OR REPLACE FUNCTION public.validate_utm_params(utm_data jsonb) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check for valid UTM parameter formats
  IF utm_data ? 'utm_source' THEN
    IF length(utm_data->>'utm_source') > 255 OR NOT (utm_data->>'utm_source' ~ '^[a-zA-Z0-9_-]+$') THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  IF utm_data ? 'utm_medium' THEN
    IF length(utm_data->>'utm_medium') > 255 OR NOT (utm_data->>'utm_medium' ~ '^[a-zA-Z0-9_-]+$') THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  IF utm_data ? 'utm_campaign' THEN
    IF length(utm_data->>'utm_campaign') > 255 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_session_id(session_id text) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Session ID should start with 'sess_' and be properly formatted
  RETURN session_id ~ '^sess_\d+_[a-zA-Z0-9]{9}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.detect_honeypot(form_data jsonb) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check for common honeypot field names that should be empty
  IF form_data ? 'website' OR 
     form_data ? 'url' OR 
     form_data ? 'honeypot' OR
     form_data ? 'bot_field' THEN
    RETURN TRUE; -- Honeypot detected
  END IF;
  
  RETURN FALSE;
END;
$$;