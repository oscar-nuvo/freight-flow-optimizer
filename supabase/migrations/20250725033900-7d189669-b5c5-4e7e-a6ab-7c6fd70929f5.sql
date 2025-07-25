-- Enhanced handle_new_user function with security hardening and robustness improvements
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_org_id UUID;
  company_name TEXT;
  user_full_name TEXT;
  user_email TEXT;
BEGIN
  -- Input validation and sanitization
  user_email := COALESCE(NEW.email, '');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', '');
  company_name := COALESCE(NEW.raw_user_meta_data->>'companyName', NEW.raw_user_meta_data->>'company_name', 'My Organization');
  
  -- Validate email format
  IF user_email = '' OR user_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', user_email;
  END IF;
  
  -- Sanitize company name (remove potentially harmful characters, limit length)
  company_name := TRIM(regexp_replace(company_name, '[<>"\'';&]', '', 'g'));
  company_name := LEFT(company_name, 100);
  IF LENGTH(company_name) < 1 THEN
    company_name := 'My Organization';
  END IF;
  
  -- Sanitize full name
  user_full_name := TRIM(regexp_replace(user_full_name, '[<>"\'';&]', '', 'g'));
  user_full_name := LEFT(user_full_name, 100);
  
  BEGIN
    -- Create organization first (atomic operation)
    INSERT INTO public.organizations (name, subscription_status)
    VALUES (company_name, 'free')
    RETURNING id INTO new_org_id;
    
    -- Create user profile linked to the organization
    INSERT INTO public.profiles (id, full_name, email, org_id)
    VALUES (NEW.id, user_full_name, user_email, new_org_id);
    
    -- Log the successful user creation for audit trail
    PERFORM create_audit_log(
      'user',
      NEW.id,
      'create',
      jsonb_build_object(
        'user_id', NEW.id,
        'email', user_email,
        'organization_id', new_org_id,
        'organization_name', company_name
      ),
      jsonb_build_object(
        'signup_method', 'email',
        'ip_address', NEW.raw_app_meta_data->>'ip_address'
      )
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error for debugging
      RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
      -- Re-raise the exception to prevent user creation if profile/org creation fails
      RAISE EXCEPTION 'Failed to create user profile and organization: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();