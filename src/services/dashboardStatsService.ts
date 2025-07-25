
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalCarriers: number;
  activeBids: number;
  totalRoutes: number;
}

// Get total carriers count for the organization
export const getTotalCarriersCount = async (): Promise<number> => {
  try {
    // Get current user's profile to find their organization
    const { data: profile, error: profileError } = await supabase.auth.getUser();
    
    if (profileError || !profile?.user?.id) {
      throw new Error("Unable to determine current user");
    }
    
    // Get the user's organization from their profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", profile.user.id)
      .single();
    
    if (userProfileError || !userProfile?.org_id) {
      throw new Error("Unable to determine your organization");
    }
    
    // Count carriers for the organization
    const { count, error } = await supabase
      .from("carriers")
      .select("*", { count: "exact", head: true })
      .eq("org_id", userProfile.org_id);

    if (error) {
      console.error("Error fetching carriers count:", error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getTotalCarriersCount:", error);
    return 0;
  }
};

// Get active bids count for the organization
export const getActiveBidsCount = async (): Promise<number> => {
  try {
    // Get current user's profile to find their organization
    const { data: profile, error: profileError } = await supabase.auth.getUser();
    
    if (profileError || !profile?.user?.id) {
      throw new Error("Unable to determine current user");
    }
    
    // Get the user's organization from their profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", profile.user.id)
      .single();
    
    if (userProfileError || !userProfile?.org_id) {
      throw new Error("Unable to determine your organization");
    }
    
    // Count active bids for the organization
    const { count, error } = await supabase
      .from("bids")
      .select("*", { count: "exact", head: true })
      .eq("org_id", userProfile.org_id)
      .eq("status", "active");

    if (error) {
      console.error("Error fetching bids count:", error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getActiveBidsCount:", error);
    return 0;
  }
};

// Get total routes count for the organization
export const getTotalRoutesCount = async (): Promise<number> => {
  try {
    // Get current user's profile to find their organization
    const { data: profile, error: profileError } = await supabase.auth.getUser();
    
    if (profileError || !profile?.user?.id) {
      throw new Error("Unable to determine current user");
    }
    
    // Get the user's organization from their profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", profile.user.id)
      .single();
    
    if (userProfileError || !userProfile?.org_id) {
      throw new Error("Unable to determine your organization");
    }
    
    // Count active routes for the organization
    const { count, error } = await supabase
      .from("routes")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", userProfile.org_id)
      .eq("is_deleted", false);

    if (error) {
      console.error("Error fetching routes count:", error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getTotalRoutesCount:", error);
    return 0;
  }
};

// Get all dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [totalCarriers, activeBids, totalRoutes] = await Promise.all([
    getTotalCarriersCount(),
    getActiveBidsCount(),
    getTotalRoutesCount()
  ]);

  return {
    totalCarriers,
    activeBids,
    totalRoutes
  };
};
