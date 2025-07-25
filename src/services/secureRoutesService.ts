import { supabase } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';
import { Route, EquipmentType } from "@/types/route";
import { routeLogger } from "./routesServiceLogger";

// Create Supabase client with invitation token header
function createSupabaseWithToken(invitationToken: string) {
  const SUPABASE_URL = "https://oqiuljtbildhwgsgnfbo.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xaXVsanRiaWxkaHdnc2duZmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MDA4ODMsImV4cCI6MjA2MDE3Njg4M30.cTyNPALPFlimzEf2bj3pb1F3yeYecTqYwIs7jCTU9Uc";
  
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      headers: {
        'invitation-token': invitationToken
      }
    }
  });
}

/**
 * Secure service for fetching routes with invitation token validation
 * Used for external carrier access to bid routes
 */
export async function getRoutesByBidWithToken(
  bidId: string, 
  invitationToken: string
): Promise<Route[]> {
  try {
    console.log("SecureRoutesService: Fetching routes with token validation", { bidId, hasToken: !!invitationToken });

    // First validate the invitation token
    const isValidToken = await validateInvitationAccess(bidId, invitationToken);
    routeLogger.logTokenValidation(bidId, invitationToken, isValidToken);
    
    if (!isValidToken) {
      const errorMsg = "Invalid or expired invitation token";
      console.error("SecureRoutesService:", errorMsg);
      routeLogger.logCarrierAccess(bidId, invitationToken, false, 0, errorMsg);
      throw new Error(errorMsg);
    }

    // Create Supabase client with invitation token header for RLS policy
    const supabaseWithToken = createSupabaseWithToken(invitationToken);
    console.log("SecureRoutesService: Using client with invitation token header");

    // Fetch routes using client with header
    const { data: routes, error } = await supabaseWithToken
      .from('routes')
      .select(`
        *,
        route_bids!inner(bid_id)
      `)
      .eq('route_bids.bid_id', bidId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("SecureRoutesService: Database error:", error);
      throw new Error(`Failed to fetch routes: ${error.message}`);
    }

    if (!routes || !Array.isArray(routes)) {
      console.warn("SecureRoutesService: No routes returned or invalid format");
      return [];
    }

    // Transform and validate the data
    const transformedRoutes: Route[] = routes.map(route => ({
      ...route,
      equipment_type: route.equipment_type as EquipmentType
    }));

    console.log("SecureRoutesService: Successfully fetched routes:", transformedRoutes.length);
    routeLogger.logCarrierAccess(bidId, invitationToken, true, transformedRoutes.length);
    return transformedRoutes;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error("SecureRoutesService: Error in getRoutesByBidWithToken:", error);
    routeLogger.logCarrierAccess(bidId, invitationToken, false, 0, errorMsg);
    throw error;
  }
}

/**
 * Validates invitation token access to a specific bid
 */
export async function validateInvitationAccess(
  bidId: string, 
  invitationToken: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('bid_carrier_invitations')
      .select('id, status')
      .eq('bid_id', bidId)
      .eq('token', invitationToken)
      .in('status', ['opened', 'responded'])
      .maybeSingle();

    if (error) {
      console.error("SecureRoutesService: Token validation error:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("SecureRoutesService: Error validating invitation access:", error);
    return false;
  }
}