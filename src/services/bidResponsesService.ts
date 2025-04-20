
import { supabase } from "@/integrations/supabase/client";
import { BidResponseFormValues, BidResponseSubmission, BidResponseWithRates } from "@/types/bidResponse";

// Submit a new bid response or update an existing one
export const submitBidResponse = async (
  bidId: string,
  carrierId: string,
  invitationId: string,
  formValues: BidResponseFormValues,
  isDraft: boolean = false
): Promise<BidResponseWithRates> => {
  try {
    // First, check for an existing response to get the current version
    let currentVersion = 1;
    const { data: existingResponse } = await supabase
      .from("carrier_bid_responses")
      .select("version")
      .eq("bid_id", bidId)
      .eq("carrier_id", carrierId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingResponse) {
      currentVersion = existingResponse.version + 1;
    }

    // Count how many routes have rates
    const routesWithRates = Object.entries(formValues.routeRates).filter(
      ([_, value]) => value.value !== null && value.value !== undefined
    ).length;

    // Insert the new response
    const { data: responseData, error: responseError } = await supabase
      .from("carrier_bid_responses")
      .insert({
        bid_id: bidId,
        carrier_id: carrierId,
        invitation_id: invitationId,
        responder_name: formValues.responderName,
        responder_email: formValues.responderEmail,
        version: currentVersion,
        routes_submitted: routesWithRates,
        // Add is_draft flag when this feature is needed
      })
      .select()
      .single();

    if (responseError) {
      console.error("Error creating bid response:", responseError);
      throw new Error(responseError.message);
    }

    // Insert route rates with references to the response
    const rateInserts = Object.entries(formValues.routeRates)
      .filter(([_, value]) => value.value !== null && value.value !== undefined)
      .map(([routeId, value]) => ({
        bid_id: bidId,
        carrier_id: carrierId,
        route_id: routeId,
        response_id: responseData.id,
        value: value.value,
        currency: "USD", // This should come from bid settings
        comment: value.comment,
        version: currentVersion
      }));

    if (rateInserts.length > 0) {
      const { error: ratesError } = await supabase
        .from("carrier_route_rates")
        .insert(rateInserts);

      if (ratesError) {
        console.error("Error inserting route rates:", ratesError);
        throw new Error(ratesError.message);
      }
    }

    // If not a draft, update invitation status
    if (!isDraft) {
      await supabase
        .from("bid_carrier_invitations")
        .update({ status: "responded", responded_at: new Date().toISOString() })
        .eq("id", invitationId);
    }

    // Return formatted response with rates
    return {
      ...responseData,
      rates: Object.entries(formValues.routeRates).reduce((acc, [routeId, value]) => {
        if (value.value !== null && value.value !== undefined) {
          acc[routeId] = {
            id: routeId,
            value: value.value,
            currency: "USD", // Default currency
            comment: value.comment
          };
        }
        return acc;
      }, {} as Record<string, any>)
    };
  } catch (error: any) {
    console.error("Error in submitBidResponse:", error);
    throw error;
  }
};

// Get existing response with rates for a bid and carrier
export const getExistingResponse = async (
  bidId: string,
  carrierId: string
): Promise<BidResponseWithRates | null> => {
  try {
    // Get the latest response version
    const { data: responseData, error: responseError } = await supabase
      .from("carrier_bid_responses")
      .select("*")
      .eq("bid_id", bidId)
      .eq("carrier_id", carrierId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (responseError) {
      console.error("Error fetching bid response:", responseError);
      throw new Error(responseError.message);
    }

    if (!responseData) {
      return null;
    }

    // Get the rates for this response
    const { data: ratesData, error: ratesError } = await supabase
      .from("carrier_route_rates")
      .select("*")
      .eq("response_id", responseData.id);

    if (ratesError) {
      console.error("Error fetching route rates:", ratesError);
      throw new Error(ratesError.message);
    }

    // Format the response with rates
    const rates = (ratesData || []).reduce((acc, rate) => {
      acc[rate.route_id] = {
        id: rate.id,
        value: rate.value,
        currency: rate.currency,
        comment: rate.comment
      };
      return acc;
    }, {} as Record<string, any>);

    return {
      ...responseData,
      rates
    };
  } catch (error: any) {
    console.error("Error in getExistingResponse:", error);
    throw error;
  }
};
