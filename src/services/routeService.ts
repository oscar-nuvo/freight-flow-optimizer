
/**
 * @file Route Service
 * 
 * This service handles CRUD operations for routes with proper RLS policies in place.
 */
import { supabase } from "@/integrations/supabase/client";
import { Route, RouteFormValues } from "@/types/route";

export const getRoutes = async () => {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }

  return data;
};

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
    throw error;
  }

  return data;
};

export const deleteRoute = async (id: string) => {
  const { error } = await supabase
    .from("routes")
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
};
