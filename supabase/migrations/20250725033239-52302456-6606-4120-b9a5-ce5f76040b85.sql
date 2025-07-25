-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.is_new_org(org_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE org_id = org_uuid
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_member_of_org(org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE 
      profiles.org_id = is_member_of_org.org_id 
      AND profiles.id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE 
      profiles.org_id = is_org_admin.org_uuid 
      AND profiles.id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_org_member(org_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE 
      profiles.org_id = is_org_member.org_uuid 
      AND profiles.id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_of_org(org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE 
      profiles.org_id = is_admin_of_org.org_id 
      AND profiles.id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_route_bid_org_id(route_bid_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get the organization ID from the bids table directly
  SELECT b.org_id INTO v_org_id
  FROM public.bids b
  JOIN public.route_bids rb ON rb.bid_id = b.id
  WHERE rb.id = route_bid_id;
  
  RETURN v_org_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organizations()
 RETURNS SETOF uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY 
    SELECT profiles.org_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.org_id IS NOT NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_org_id(user_id uuid DEFAULT auth.uid())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  -- Get org_id from profiles table instead of org_memberships
  SELECT org_id INTO v_org_id
  FROM public.profiles
  WHERE id = get_user_org_id.user_id;
  
  RETURN v_org_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_orgs()
 RETURNS SETOF uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY 
    SELECT profiles.org_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.org_id IS NOT NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_invitation_for_token(p_token text)
 RETURNS TABLE(bid_id uuid, carrier_id uuid, organization_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    bci.bid_id,
    bci.carrier_id,
    bci.organization_id
  FROM 
    public.bid_carrier_invitations bci
  WHERE 
    bci.token = p_token
    AND bci.status IN ('opened', 'responded');
END;
$function$;

CREATE OR REPLACE FUNCTION public.carrier_has_bid_access(carrier_id uuid, bid_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bid_carrier_invitations
    WHERE bid_carrier_invitations.carrier_id = carrier_has_bid_access.carrier_id
    AND bid_carrier_invitations.bid_id = carrier_has_bid_access.bid_id
    AND bid_carrier_invitations.status IN ('opened', 'responded')
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_audit_log(p_entity_type text, p_entity_id uuid, p_action text, p_changes jsonb DEFAULT NULL::jsonb, p_metadata jsonb DEFAULT NULL::jsonb, p_ip_address text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_org_id UUID;
  v_result UUID;
BEGIN
  -- Get the user's organization
  SELECT get_user_org_id() INTO v_org_id;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'User not associated with an organization';
  END IF;

  -- Insert the audit log
  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    changes,
    metadata,
    ip_address
  ) VALUES (
    v_org_id,
    auth.uid(),
    p_entity_type,
    p_entity_id,
    p_action,
    p_changes,
    p_metadata,
    p_ip_address
  ) RETURNING id INTO v_result;
  
  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_accessible_bid_routes(bid_id uuid)
 RETURNS SETOF uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_org_id UUID;
  v_carrier_id UUID;
  v_invitation_status TEXT;
BEGIN
  -- Log access attempt for debugging
  RAISE LOG 'Checking bid route access for bid_id: %, user_id: %', bid_id, auth.uid();
  
  -- Get the organization ID for the bid
  SELECT org_id INTO v_org_id
  FROM bids
  WHERE id = bid_id;

  -- Check if user is a member of the organization
  IF EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND org_id = v_org_id
  ) THEN
    -- Organization members can access all routes in the bid
    RAISE LOG 'Organization member access granted for bid: %', bid_id;
    RETURN QUERY 
      SELECT route_id 
      FROM route_bids 
      WHERE bid_id = get_accessible_bid_routes.bid_id;
    RETURN;
  END IF;

  -- For carriers, check if they have a valid invitation
  SELECT 
    bci.carrier_id,
    bci.status 
  INTO v_carrier_id, v_invitation_status
  FROM bid_carrier_invitations bci
  WHERE bci.bid_id = get_accessible_bid_routes.bid_id
  AND bci.status IN ('opened', 'responded');

  -- Log carrier access attempt
  RAISE LOG 'Carrier access check - carrier_id: %, status: %', v_carrier_id, v_invitation_status;

  -- If carrier has valid access, return associated routes
  IF v_carrier_id IS NOT NULL AND v_invitation_status IN ('opened', 'responded') THEN
    RAISE LOG 'Carrier access granted for bid: %', bid_id;
    RETURN QUERY 
      SELECT route_id 
      FROM route_bids 
      WHERE bid_id = get_accessible_bid_routes.bid_id;
    RETURN;
  END IF;

  -- If no access conditions are met, return empty set
  RAISE LOG 'Access denied for bid: %', bid_id;
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_valid_invitation_token(bid_id uuid, token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- A token is valid if it exists in bid_carrier_invitations for the given bid_id
  -- and has a status that allows access (opened or responded)
  RETURN EXISTS (
    SELECT 1 
    FROM public.bid_carrier_invitations
    WHERE bid_carrier_invitations.bid_id = has_valid_invitation_token.bid_id
      AND bid_carrier_invitations.token = has_valid_invitation_token.token
      AND bid_carrier_invitations.status IN ('opened', 'responded')
  );
END;
$function$;

-- Add missing external carrier policies for carrier_bid_responses
CREATE POLICY "Allow carriers to create responses through invitation" 
ON public.carrier_bid_responses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bid_carrier_invitations
    WHERE bid_carrier_invitations.bid_id = carrier_bid_responses.bid_id
    AND bid_carrier_invitations.carrier_id = carrier_bid_responses.carrier_id
    AND bid_carrier_invitations.status IN ('opened', 'responded')
  )
);

CREATE POLICY "Allow carriers to read their responses through invitation" 
ON public.carrier_bid_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.bid_carrier_invitations
    WHERE bid_carrier_invitations.bid_id = carrier_bid_responses.bid_id
    AND bid_carrier_invitations.carrier_id = carrier_bid_responses.carrier_id
    AND bid_carrier_invitations.status IN ('opened', 'responded')
  )
);

CREATE POLICY "Allow carriers to update their responses through invitation" 
ON public.carrier_bid_responses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.bid_carrier_invitations
    WHERE bid_carrier_invitations.bid_id = carrier_bid_responses.bid_id
    AND bid_carrier_invitations.carrier_id = carrier_bid_responses.carrier_id
    AND bid_carrier_invitations.status IN ('opened', 'responded')
  )
);

-- Add missing external carrier UPDATE policy for carrier_route_rates
CREATE POLICY "Allow carriers to update rates through invitation" 
ON public.carrier_route_rates 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.bid_carrier_invitations bci
    WHERE bci.bid_id = carrier_route_rates.bid_id
    AND bci.carrier_id = carrier_route_rates.carrier_id
    AND bci.status IN ('opened', 'responded')
  )
);