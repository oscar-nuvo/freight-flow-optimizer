-- Fix search paths for the remaining 2 functions to complete security fixes

-- Fix get_enum_values function  
CREATE OR REPLACE FUNCTION public.get_enum_values(enum_type text)
RETURNS TABLE(enum_value text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY EXECUTE 'SELECT unnest(enum_range(NULL::' || enum_type || '))::text';
END;
$$;

-- Fix jsonb_diff_val function
CREATE OR REPLACE FUNCTION public.jsonb_diff_val(val1 jsonb, val2 jsonb)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
IMMUTABLE
AS $$
    SELECT jsonb_object_agg(
        key,
        CASE
            -- If val1 has key and val2 has key, but they're different
            WHEN jsonb_typeof(val1 -> key) = 'object' AND jsonb_typeof(val2 -> key) = 'object' 
            THEN jsonb_diff_val(val1 -> key, val2 -> key)
            ELSE val2 -> key
        END
    )
    FROM (
        SELECT key FROM jsonb_object_keys(val1) AS key
        UNION
        SELECT key FROM jsonb_object_keys(val2) AS key
    ) AS keys
    WHERE val1 -> key IS DISTINCT FROM val2 -> key
$$;