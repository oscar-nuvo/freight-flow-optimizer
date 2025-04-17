import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface Carrier {
  id: string;
  name: string;
  mc_number?: string;
  usdot_number?: string;
  rfc_number?: string;
  tax_id?: string;
  scac?: string;
  status: string;
  created_at: string;
  updated_at: string;
  org_id: string;
  invite_token?: string;
  invite_sent_at?: string;
  profile_completed_at?: string;
  
  // Contact Information
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  
  // Address Information
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  
  // Additional Information
  website?: string;
  description?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
}

export interface CarrierFormData {
  name: string;
  mc_number?: string;
  usdot_number?: string;
  rfc_number?: string;
}

// Get carriers for the organization
export const getCarriers = async (): Promise<Carrier[]> => {
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
    
    // Use type assertion to tell TypeScript that 'carriers' is a valid table
    const { data, error } = await supabase
      .from("carriers")
      .select("*")
      .eq("org_id", userProfile.org_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching carriers:", error);
      throw error;
    }

    return data as Carrier[];
  } catch (error) {
    console.error("Error in getCarriers:", error);
    return []; // Return empty array instead of throwing to prevent UI errors
  }
};

// Create a new carrier
export const createCarrier = async (formData: CarrierFormData): Promise<Carrier> => {
  // Get user information from Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in to create a carrier.");
  }
  
  // Get user's organization from their profile
  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  
  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    throw profileError;
  }
  
  if (!userProfile?.org_id) {
    throw new Error("You must be a member of an organization to create carriers.");
  }
  
  const orgId = userProfile.org_id;

  try {
    // Use type assertion to tell TypeScript that 'carriers' is a valid table
    const { data, error } = await supabase
      .from("carriers")
      .insert({
        ...formData,
        org_id: orgId,
        status: "pending",
        invite_token: uuidv4(), // Generate a unique token for the carrier invite
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating carrier:", error);
      throw error;
    }

    return data as Carrier;
  } catch (error: any) {
    console.error("Error in createCarrier:", error);
    // Add more detailed error information
    if (error.message?.includes("violates row-level security policy")) {
      throw new Error("You don't have permission to create carriers in this organization.");
    }
    throw error;
  }
};

// Get a carrier by ID
export const getCarrierById = async (id: string): Promise<Carrier | null> => {
  try {
    const { data, error } = await supabase
      .from("carriers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching carrier:", error);
      throw error;
    }

    return data as Carrier;
  } catch (error) {
    console.error("Error in getCarrierById:", error);
    throw error;
  }
};

// Update a carrier
export const updateCarrier = async (id: string, updates: Partial<Carrier>): Promise<Carrier> => {
  try {
    const { data, error } = await supabase
      .from("carriers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating carrier:", error);
      throw error;
    }

    return data as Carrier;
  } catch (error: any) {
    console.error("Error in updateCarrier:", error);
    if (error.message?.includes("violates row-level security policy")) {
      throw new Error("You don't have permission to update this carrier.");
    }
    throw error;
  }
};

// Send an invite to a carrier to complete their profile
export const sendCarrierInvite = async (carrierId: string, email: string): Promise<void> => {
  try {
    // First get the carrier to ensure it exists and get the invite token
    // Use type assertion to tell TypeScript that 'carriers' is a valid table
    const { data: carrier, error: fetchError } = await supabase
      .from("carriers")
      .select("*")
      .eq("id", carrierId)
      .single();

    if (fetchError) {
      console.error("Error fetching carrier:", fetchError);
      throw fetchError;
    }

    // Update invite_sent_at timestamp
    // Use type assertion to tell TypeScript that 'carriers' is a valid table
    const { error: updateError } = await supabase
      .from("carriers")
      .update({ invite_sent_at: new Date().toISOString() })
      .eq("id", carrierId);

    if (updateError) {
      console.error("Error updating carrier invite status:", updateError);
      throw updateError;
    }
    
    // In a real app, you would send an email with a link like:
    // https://yourdomain.com/carrier/profile?token=${carrier.invite_token}
    console.log(`Invite would be sent to ${email} with token ${(carrier as Carrier).invite_token}`);
  } catch (error: any) {
    console.error("Error in sendCarrierInvite:", error);
    if (error.message?.includes("violates row-level security policy")) {
      throw new Error("You don't have permission to send invites to this carrier.");
    }
    throw error;
  }
};

// Get a carrier by its invite token
export const getCarrierByToken = async (token: string): Promise<Carrier | null> => {
  try {
    // Use type assertion to tell TypeScript that 'carriers' is a valid table
    const { data, error } = await supabase
      .from("carriers")
      .select("*")
      .eq("invite_token", token)
      .maybeSingle();

    if (error) {
      console.error("Error fetching carrier by token:", error);
      throw error;
    }

    return data as Carrier;
  } catch (error) {
    console.error("Error in getCarrierByToken:", error);
    return null; // Return null instead of throwing to prevent UI errors
  }
};
