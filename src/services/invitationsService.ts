
import { supabase } from "@/integrations/supabase/client";
import { CarrierInvitation, InvitationFormData, CarrierBidResponse, CarrierRouteRate } from "@/types/invitation";
import { v4 as uuidv4 } from "uuid";
import { Carrier } from "./carriersService";

// Get all invitations for a specific bid
export const getBidInvitations = async (bidId: string): Promise<CarrierInvitation[]> => {
  try {
    const { data, error } = await supabase
      .from("bid_carrier_invitations")
      .select("*")
      .eq("bid_id", bidId);

    if (error) {
      console.error("Error fetching bid invitations:", error);
      throw error;
    }

    return data as CarrierInvitation[];
  } catch (error) {
    console.error("Error in getBidInvitations:", error);
    throw error;
  }
};

// Get active carriers (for invitation)
export const getActiveCarriersForInvitation = async (): Promise<Carrier[]> => {
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
    
    // Fetch only active carriers from the organization
    const { data, error } = await supabase
      .from("carriers")
      .select("*")
      .eq("org_id", userProfile.org_id)
      .eq("status", "active")
      .order("name");

    if (error) {
      console.error("Error fetching active carriers:", error);
      throw error;
    }

    return data as Carrier[];
  } catch (error) {
    console.error("Error in getActiveCarriersForInvitation:", error);
    return []; // Return empty array instead of throwing to prevent UI errors
  }
};

// Create invitations for carriers
export const createBidInvitations = async (
  bidId: string, 
  invitationData: InvitationFormData
): Promise<CarrierInvitation[]> => {
  try {
    // Get user information
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error("You must be logged in to create invitations");
    }
    
    const invitations = invitationData.carrier_ids.map(carrierId => ({
      bid_id: bidId,
      carrier_id: carrierId,
      token: uuidv4(),
      status: 'pending' as const,
      invited_at: new Date().toISOString(),
      custom_message: invitationData.custom_message,
      delivery_channels: invitationData.delivery_channels,
      delivery_status: {}, // Will be populated after delivery attempts
      created_by: userData.user.id
    }));
    
    const { data, error } = await supabase
      .from("bid_carrier_invitations")
      .insert(invitations)
      .select();
      
    if (error) {
      console.error("Error creating bid invitations:", error);
      throw error;
    }
    
    return data as CarrierInvitation[];
  } catch (error: any) {
    console.error("Error in createBidInvitations:", error);
    throw error;
  }
};

// Get invitation by token
export const getInvitationByToken = async (token: string): Promise<CarrierInvitation | null> => {
  try {
    const { data, error } = await supabase
      .from("bid_carrier_invitations")
      .select("*")
      .eq("token", token)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching invitation by token:", error);
      throw error;
    }
    
    return data as CarrierInvitation;
  } catch (error) {
    console.error("Error in getInvitationByToken:", error);
    return null;
  }
};

// Update invitation status
export const updateInvitationStatus = async (
  invitationId: string,
  status: 'delivered' | 'opened' | 'responded' | 'revoked',
  additionalData?: Partial<CarrierInvitation>
): Promise<CarrierInvitation> => {
  try {
    const updates: any = { status };
    
    if (status === 'responded') {
      updates.responded_at = new Date().toISOString();
    } else if (status === 'revoked') {
      updates.revoked_at = new Date().toISOString();
    }
    
    if (additionalData) {
      Object.assign(updates, additionalData);
    }
    
    const { data, error } = await supabase
      .from("bid_carrier_invitations")
      .update(updates)
      .eq("id", invitationId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating invitation status:", error);
      throw error;
    }
    
    return data as CarrierInvitation;
  } catch (error) {
    console.error("Error in updateInvitationStatus:", error);
    throw error;
  }
};
