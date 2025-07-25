import { supabase } from "@/integrations/supabase/client";
import { Route, EquipmentType } from "@/types/route";

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

    // Set the invitation-token header for RLS policy validation
    const { data: routes, error } = await supabase
      .from('routes')
      .select(`
        *,
        route_bids!inner(bid_id)
      `)
      .eq('route_bids.bid_id', bidId)
      .eq('is_deleted', false)
      .neq('weekly_volume', 0)
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
    return transformedRoutes;

  } catch (error) {
    console.error("SecureRoutesService: Error in getRoutesByBidWithToken:", error);
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