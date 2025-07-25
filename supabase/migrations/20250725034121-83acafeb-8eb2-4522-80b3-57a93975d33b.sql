-- Fix search paths for all remaining functions to enhance security

-- Fix update_timestamp function
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix bids_audit_trigger function
CREATE OR REPLACE FUNCTION public.bids_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'bid', 
      NEW.id, 
      'create', 
      jsonb_build_object('bid', row_to_json(NEW)::jsonb),
      NULL
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if there are actual changes
    IF NEW IS DISTINCT FROM OLD THEN
      PERFORM create_audit_log(
        'bid', 
        NEW.id, 
        'update', 
        jsonb_build_object(
          'old', row_to_json(OLD)::jsonb,
          'new', row_to_json(NEW)::jsonb,
          'changes', jsonb_diff_val(row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb)
        ),
        NULL
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'bid', 
      OLD.id, 
      'delete', 
      jsonb_build_object('bid', row_to_json(OLD)::jsonb),
      NULL
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- Fix carriers_audit_trigger function
CREATE OR REPLACE FUNCTION public.carriers_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'carrier', 
      NEW.id, 
      'create', 
      jsonb_build_object('carrier', row_to_json(NEW)::jsonb),
      NULL
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if there are actual changes
    IF NEW IS DISTINCT FROM OLD THEN
      PERFORM create_audit_log(
        'carrier', 
        NEW.id, 
        'update', 
        jsonb_build_object(
          'old', row_to_json(OLD)::jsonb,
          'new', row_to_json(NEW)::jsonb,
          'changes', jsonb_diff_val(row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb)
        ),
        NULL
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'carrier', 
      OLD.id, 
      'delete', 
      jsonb_build_object('carrier', row_to_json(OLD)::jsonb),
      NULL
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- Fix routes_audit_trigger function
CREATE OR REPLACE FUNCTION public.routes_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'route', 
      NEW.id, 
      'create', 
      jsonb_build_object('route', row_to_json(NEW)::jsonb),
      NULL
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if there are actual changes
    IF NEW IS DISTINCT FROM OLD THEN
      PERFORM create_audit_log(
        'route', 
        NEW.id, 
        'update', 
        jsonb_build_object(
          'old', row_to_json(OLD)::jsonb,
          'new', row_to_json(NEW)::jsonb,
          'changes', jsonb_diff_val(row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb)
        ),
        NULL
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'route', 
      OLD.id, 
      'delete', 
      jsonb_build_object('route', row_to_json(OLD)::jsonb),
      NULL
    );
  END IF;
  
  RETURN NULL;
END;
$$;