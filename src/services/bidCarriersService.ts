
import { supabase } from "@/integrations/supabase/client";
import { Carrier } from "./carriersService";
import { CarrierInvitation } from "@/types/invitation";

// Get all carriers that have been invited to a bid
export const getBidCarriers = async (bidId: string): Promise<{ carrier: Carrier; invitation: CarrierInvitation }[]> => {
  try {
    // Use plain query until supabase types are regenerated for new tables
    const { data, error } = await supabase
      .from("bid_carrier_invitations")
      .select(`
        *,
        carrier:carriers(*)
      `)
      .eq("bid_id", bidId);

    if (error) {
      console.error("Error fetching bid carriers:", error);
      throw error;
    }

    if (!data) return [];

    // Map the data to the expected format
    return data.map((item: any) => ({
      carrier: item.carrier as Carrier,
      invitation: {
        id: item.id,
        bid_id: item.bid_id,
        carrier_id: item.carrier_id,
        token: item.token,
        status: item.status,
        invited_at: item.invited_at,
        revoked_at: item.revoked_at,
        responded_at: item.responded_at,
        custom_message: item.custom_message,
        delivery_channels: item.delivery_channels,
        delivery_status: item.delivery_status,
        created_by: item.created_by
      } as CarrierInvitation
    }));
  } catch (error) {
    console.error("Error in getBidCarriers:", error);
    return [];
  }
};

// Check if a carrier has already been invited to a bid
export const isCarrierInvited = async (bidId: string, carrierId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("bid_carrier_invitations")
      .select("id")
      .eq("bid_id", bidId)
      .eq("carrier_id", carrierId)
      .maybeSingle();

    if (error) {
      console.error("Error checking if carrier is invited:", error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("Error in isCarrierInvited:", error);
    return false;
  }
};

// Get count of invitations for a bid
export const getBidInvitationsCount = async (bidId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("bid_carrier_invitations")
      .select("id", { count: 'exact', head: true })
      .eq("bid_id", bidId);

    if (error) {
      console.error("Error counting bid invitations:", error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getBidInvitationsCount:", error);
    return 0;
  }
};
