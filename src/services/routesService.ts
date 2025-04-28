
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

  // This data doesn't need to be cast here as we'll handle it at the component level
  return data;
};

export const getRoutesByBid = async (bidId: string) => {
  console.log("[getRoutesByBid] Fetching routes for bid:", bidId);

  try {
    // Get all route-bid associations for this bid, plus the route details
    // Fix ambiguous column reference by fully qualifying the bid_id column with table alias
    const { data, error } = await supabase
      .from("route_bids")
      .select(`
        route_id,
        routes:routes!route_id (
          id,
          origin_city,
          destination_city,
          commodity,
          equipment_type,
          weekly_volume,
          distance,
          is_deleted,
          organization_id,
          created_at,
          updated_at,
          route_bids!route_id (
            bid_id
          )
        )
      `)
      .eq("route_bids.bid_id", bidId); // Explicitly qualify bid_id with the table name

    if (error) {
      console.error("[getRoutesByBid] Error fetching route_bids:", error);
      throw new Error(`Failed to retrieve routes: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log("[getRoutesByBid] No routes associated with bid:", bidId);
      return [];
    }

    // Filter out deleted routes and transform the data structure
    const routes = data
      .filter(item => item.routes && !item.routes.is_deleted)
      .map(item => ({
        ...item.routes,
        equipment_type: mapToEquipmentType(item.routes.equipment_type),
        route_bids: item.routes.route_bids || []
      })) as Route[]; // Explicitly cast to Route[]

    console.log(`[getRoutesByBid] Returning ${routes.length} route(s) for bid`, bidId);
    return routes;

  } catch (err) {
    console.error("[getRoutesByBid] Exception:", err);
    throw err;
  }
};

function mapToEquipmentType(equipmentType: string): EquipmentType {
  // Defensive: treat empty or undefined as "Dry Van"
  if (typeof equipmentType !== "string" || equipmentType.trim() === "") {
    console.warn(`[mapToEquipmentType] Missing or invalid equipment type input: ${equipmentType}, defaulting to 'Dry Van'`);
    return 'Dry Van';
  }
  // Normalize for matching
  const normalizedType = equipmentType.toLowerCase().trim();
  if (normalizedType.includes('dry') || normalizedType.includes('van')) {
    return 'Dry Van';
  } else if (normalizedType.includes('reefer')) {
    return 'Reefer';
  } else if (normalizedType.includes('flat') || normalizedType.includes('bed')) {
    return 'Flatbed';
  }
  // Fallback to 'Dry Van'
  console.warn(`[mapToEquipmentType] Unknown equipment type: ${equipmentType}, defaulting to 'Dry Van'`);
  return 'Dry Van';
}

export const createRoute = async (values: RouteFormValues) => {
  // Get the user's organization ID and add it to the route data
  const { data: orgData, error: orgError } = await supabase.rpc('get_user_org_id');
  
  if (orgError) {
    console.error("Error getting organization ID:", orgError);
    throw orgError;
  }
  
  if (!orgData) {
    throw new Error('User is not associated with an organization');
  }

  const routeData = {
    ...values,
    organization_id: orgData
  };
  
  const { data, error } = await supabase
    .from("routes")
    .insert(routeData)
    .select()
    .single();

  if (error) {
    console.error("Error creating route:", error);
    if (error.code === '23505') {
      throw new Error('A route with these parameters already exists');
    }
    throw error;
  }

  return data;
};

export const updateRoute = async (id: string, values: Partial<RouteFormValues>) => {
  const { data, error } = await supabase
    .from("routes")
    .update(values)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating route:", error);
    if (error.code === '23505') {
      throw new Error('A route with these parameters already exists');
    }
    throw error;
  }

  return data;
};

export const deleteRoute = async (id: string) => {
  const { data: bids } = await supabase
    .from("route_bids")
    .select('bid_id, bids!inner(status)')
    .eq('route_id', id)
    .eq('bids.status', 'active');

  if (bids && bids.length > 0) {
    throw new Error('Cannot delete route as it is associated with active bids');
  }

  const { error } = await supabase
    .from("routes")
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
};

export const associateRouteWithBid = async (routeId: string, bidId: string) => {
  console.log(`Associating route ${routeId} with bid ${bidId}`);
  
  try {
    const { error } = await supabase
      .from("route_bids")
      .insert({ route_id: routeId, bid_id: bidId });

    if (error) {
      console.error("Error associating route with bid:", error);
      if (error.code === '23505') {
        throw new Error('This route is already associated with this bid');
      }
      throw error;
    }
    
    // After successful association, update the bid's lane count
    await updateBidLaneCount(bidId);
    
    console.log(`Successfully associated route ${routeId} with bid ${bidId}`);
  } catch (err) {
    console.error("Exception in associateRouteWithBid:", err);
    throw err;
  }
};

export const removeRouteFromBid = async (routeId: string, bidId: string) => {
  console.log(`Removing route ${routeId} from bid ${bidId}`);
  
  try {
    const { error } = await supabase
      .from("route_bids")
      .delete()
      .match({ route_id: routeId, bid_id: bidId });

    if (error) {
      console.error("Error removing route from bid:", error);
      throw error;
    }
    
    // After successfully removing, update the bid's lane count
    await updateBidLaneCount(bidId);
    
    console.log(`Successfully removed route ${routeId} from bid ${bidId}`);
  } catch (err) {
    console.error("Exception in removeRouteFromBid:", err);
    throw err;
  }
};

export const updateBidLaneCount = async (bidId: string) => {
  console.log(`Updating lane count for bid ${bidId}`);
  
  try {
    // First, get the count of routes associated with this bid
    const { count, error: countError } = await supabase
      .from("route_bids")
      .select('*', { count: 'exact' })
      .eq('bid_id', bidId);

    if (countError) {
      console.error("Error counting routes for bid:", countError);
      throw countError;
    }

    console.log(`Found ${count} routes for bid ${bidId}`);

    // Update the bid's lanes count
    const { error: updateError } = await supabase
      .from("bids")
      .update({ lanes: count || 0 })
      .eq('id', bidId);

    if (updateError) {
      console.error("Error updating bid lane count:", updateError);
      throw updateError;
    }
    
    console.log(`Successfully updated lane count to ${count} for bid ${bidId}`);
  } catch (err) {
    console.error("Exception in updateBidLaneCount:", err);
    throw err;
  }
};
