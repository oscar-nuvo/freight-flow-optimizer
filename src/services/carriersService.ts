
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface Carrier {
  id: string;
  name: string;
  mc_number?: string;
  usdot_number?: string;
  rfc_number?: string;
  status: string;
  created_at: string;
  updated_at: string;
  invite_sent_at?: string;
  profile_completed_at?: string;
}

export interface CarrierFormData {
  name: string;
  mc_number?: string;
  usdot_number?: string;
  rfc_number?: string;
}

// Get carriers for the organization
export const getCarriers = async (): Promise<Carrier[]> => {
  const { data, error } = await supabase
    .from("carriers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching carriers:", error);
    throw error;
  }

  return data || [];
};

// Create a new carrier
export const createCarrier = async (formData: CarrierFormData): Promise<Carrier> => {
  const { organization } = JSON.parse(localStorage.getItem("authContext") || "{}");
  
  if (!organization?.id) {
    throw new Error("No organization found. Please ensure you're logged in with an organization.");
  }

  const { data, error } = await supabase
    .from("carriers")
    .insert({
      ...formData,
      org_id: organization.id,
      status: "pending",
      invite_token: uuidv4(), // Generate a unique token for the carrier invite
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating carrier:", error);
    throw error;
  }

  return data;
};

// Send an invite to a carrier to complete their profile
export const sendCarrierInvite = async (carrierId: string, email: string): Promise<void> => {
  // First get the carrier to ensure it exists and get the invite token
  const { data: carrier, error: fetchError } = await supabase
    .from("carriers")
    .select("*")
    .eq("id", carrierId)
    .single();

  if (fetchError) {
    console.error("Error fetching carrier:", fetchError);
    throw fetchError;
  }

  // In a real application, you would send an email to the carrier with a link to the profile form
  // For this example, we'll just update the invite_sent_at timestamp

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
  console.log(`Invite would be sent to ${email} with token ${carrier.invite_token}`);
};

// Get a carrier by its invite token
export const getCarrierByToken = async (token: string): Promise<Carrier | null> => {
  const { data, error } = await supabase
    .from("carriers")
    .select("*")
    .eq("invite_token", token)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No carrier found with this token
      return null;
    }
    console.error("Error fetching carrier by token:", error);
    throw error;
  }

  return data;
};
