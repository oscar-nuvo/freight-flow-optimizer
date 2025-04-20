
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
    throw error;
  }

  return data;
};

export const createRoute = async (values: RouteFormValues) => {
  // Get the user's organization ID and add it to the route data
  const { data: orgData, error: orgError } = await supabase.rpc('get_user_org_id');
  
  if (orgError) {
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
    throw error;
  }
};

export const associateRouteWithBid = async (routeId: string, bidId: string) => {
  const { error } = await supabase
    .from("route_bids")
    .insert({ route_id: routeId, bid_id: bidId });

  if (error) {
    if (error.code === '23505') {
      throw new Error('This route is already associated with this bid');
    }
    throw error;
  }
};
