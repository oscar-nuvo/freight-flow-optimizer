
/**
 * @file Routes Service
 * 
 * This service handles all route-related operations with proper RLS policies in place.
 */
import { supabase } from "@/integrations/supabase/client";
import { Route, RouteFormValues, RouteFilters, EquipmentType } from "@/types/route";

export const getRoutes = async (filters?: RouteFilters) => {
  let query = supabase
    .from("routes")
    .select(`
      *,
      route_bids (
        bid_id
      )
    `)
    .eq('is_deleted', false);

  if (filters?.origin_city) {
    query = query.ilike('origin_city', `%${filters.origin_city}%`);
  }
  if (filters?.destination_city) {
    query = query.ilike('destination_city', `%${filters.destination_city}%`);
  }
  if (filters?.equipment_type) {
    query = query.eq('equipment_type', filters.equipment_type);
  }
  if (filters?.commodity) {
    query = query.ilike('commodity', `%${filters.commodity}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }

  // Convert equipment_type to EquipmentType enum
  return data?.map(route => ({
    ...route,
    equipment_type: route.equipment_type as EquipmentType,
    route_bids: route.route_bids || []
  })) || [];
};

export const getRoutesByBid = async (bidId: string, invitationToken?: string) => {
  console.log("[getRoutesByBid] Starting fetch for bid:", bidId, "token:", invitationToken ? "provided" : "not provided");

  try {
    // First, get all route IDs associated with this bid from route_bids
    let query = supabase
      .from("route_bids")
      .select("route_id")
      .eq("bid_id", bidId);

    // Add invitation token header if provided
    if (invitationToken) {
      console.log("[getRoutesByBid] Adding invitation token to route_bids query");
      query = query.setHeader('invitation-token', invitationToken);
    }

    const { data: routeBidData, error: routeBidError } = await query;

    if (routeBidError) {
      console.error("[getRoutesByBid] Error fetching route_bids:", routeBidError);
      throw routeBidError;
    }

    console.log("[getRoutesByBid] Route bids found:", routeBidData?.length || 0);

    if (!routeBidData?.length) return [];

    // Extract route IDs
    const routeIds = routeBidData.map(rb => rb.route_id);
    console.log("[getRoutesByBid] Route IDs:", routeIds);

    // Fetch route details for the found IDs
    let routesQuery = supabase
      .from("routes")
      .select("*, route_bids(bid_id)")
      .in("id", routeIds)
      .eq("is_deleted", false);

    // Add invitation token header if provided
    if (invitationToken) {
      console.log("[getRoutesByBid] Adding invitation token to routes query");
      routesQuery = routesQuery.setHeader('invitation-token', invitationToken);
    }

    const { data: routesData, error: routesError } = await routesQuery;

    if (routesError) {
      console.error("[getRoutesByBid] Error fetching routes:", routesError);
      throw routesError;
    }

    console.log("[getRoutesByBid] Routes fetched:", routesData?.length || 0);

    // Convert equipment_type to EquipmentType enum
    return routesData?.map(route => ({
      ...route,
      equipment_type: route.equipment_type as EquipmentType,
      route_bids: route.route_bids || []
    })) || [];
  } catch (err) {
    console.error("Error in getRoutesByBid:", err);
    throw err;
  }
};

export const createRoute = async (routeData: RouteFormValues): Promise<Route> => {
  // Get the current session to extract organization_id
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Error getting session:", sessionError);
    throw sessionError;
  }

  // Get the user's organization_id from their profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', sessionData.session?.user.id)
    .single();
  
  const orgId = profileData?.org_id;
  
  if (!orgId) {
    throw new Error("No organization found for this user");
  }

  // Create a new object that includes organization_id
  const routeWithOrg = {
    ...routeData,
    organization_id: orgId
  };

  // Insert the route with organization_id
  const { data, error } = await supabase
    .from("routes")
    .insert(routeWithOrg)
    .select()
    .single();

  if (error) {
    console.error("Error creating route:", error);
    throw error;
  }

  return {
    ...data,
    equipment_type: data.equipment_type as EquipmentType,
    route_bids: []
  };
};

export const updateRoute = async (id: string, routeData: RouteFormValues): Promise<Route> => {
  const { data, error } = await supabase
    .from("routes")
    .update(routeData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating route:", error);
    throw error;
  }

  return {
    ...data,
    equipment_type: data.equipment_type as EquipmentType,
    route_bids: []
  };
};

export const deleteRoute = async (id: string): Promise<void> => {
  // Soft delete by setting is_deleted to true
  const { error } = await supabase
    .from("routes")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
};

export const associateRouteWithBid = async (routeId: string, bidId: string) => {
  const { error } = await supabase
    .from("route_bids")
    .insert({ route_id: routeId, bid_id: bidId });

  if (error) {
    console.error("Error associating route with bid:", error);
    throw error;
  }
};

export const removeRouteFromBid = async (routeId: string, bidId: string) => {
  const { error } = await supabase
    .from("route_bids")
    .delete()
    .match({ route_id: routeId, bid_id: bidId });

  if (error) {
    console.error("Error removing route from bid:", error);
    throw error;
  }
};
