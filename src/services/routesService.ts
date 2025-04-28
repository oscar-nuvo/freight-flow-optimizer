
/**
 * @file Routes Service
 * 
 * This service handles all route-related operations with proper RLS policies in place.
 */
import { supabase } from "@/integrations/supabase/client";
import { Route, RouteFormValues, RouteFilters } from "@/types/route";

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

  return data;
};

export const getRoutesByBid = async (bidId: string) => {
  console.log("[getRoutesByBid] Fetching routes for bid:", bidId);

  try {
    // First, get all route IDs associated with this bid from route_bids
    const { data: routeBidData, error: routeBidError } = await supabase
      .from("route_bids")
      .select("route_id")
      .eq("bid_id", bidId);

    if (routeBidError) throw routeBidError;

    if (!routeBidData?.length) return [];

    // Extract route IDs
    const routeIds = routeBidData.map(rb => rb.route_id);

    // Fetch route details for the found IDs
    const { data: routesData, error: routesError } = await supabase
      .from("routes")
      .select("*, route_bids(bid_id)")
      .in("id", routeIds)
      .eq("is_deleted", false);

    if (routesError) throw routesError;

    return routesData || [];
  } catch (err) {
    console.error("Error in getRoutesByBid:", err);
    throw err;
  }
};
