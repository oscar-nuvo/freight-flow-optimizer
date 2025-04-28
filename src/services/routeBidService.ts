
/**
 * @file Route Bid Service
 * 
 * This service handles the association between routes and bids.
 */
import { supabase } from "@/integrations/supabase/client";

export const getRoutesByBid = async (bidId: string) => {
  try {
    // First get route IDs associated with this bid
    const { data: routeBidData, error: routeBidError } = await supabase
      .from("route_bids")
      .select("route_id")
      .eq("bid_id", bidId);

    if (routeBidError) throw routeBidError;
    if (!routeBidData?.length) return [];

    // Then get the actual routes
    const routeIds = routeBidData.map(rb => rb.route_id);
    const { data: routesData, error: routesError } = await supabase
      .from("routes")
      .select("*")
      .in("id", routeIds)
      .eq("is_deleted", false);

    if (routesError) throw routesError;
    return routesData || [];

  } catch (error) {
    console.error("Error in getRoutesByBid:", error);
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
