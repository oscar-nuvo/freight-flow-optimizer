import { supabase } from "@/integrations/supabase/client";
import { BidResponseFormValues, BidResponseSubmission, BidResponseWithRates, RouteRateSubmission } from "@/types/bidResponse";
import { CurrencyType } from "@/types/invitation";

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
        currency: "USD" as CurrencyType, // Fixed: Explicitly type as CurrencyType
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

// Get all responses for a specific bid
export const getBidResponses = async (bidId: string) => {
  try {
    // Get all responses for this bid
    const { data: responses, error: responsesError } = await supabase
      .from("carrier_bid_responses")
      .select(`
        id,
        bid_id,
        carrier_id,
        invitation_id,
        responder_name,
        responder_email,
        submitted_at,
        version,
        routes_submitted,
        carriers(name)
      `)
      .eq("bid_id", bidId)
      .order("submitted_at", { ascending: false });

    if (responsesError) {
      console.error("Error fetching bid responses:", responsesError);
      throw new Error(responsesError.message);
    }

    return responses || [];
  } catch (error: any) {
    console.error("Error in getBidResponses:", error);
    throw error;
  }
};

// Get full response details including rates for a specific response
export const getBidResponseDetails = async (responseId: string) => {
  try {
    // Get the response
    const { data: response, error: responseError } = await supabase
      .from("carrier_bid_responses")
      .select(`
        *,
        carriers(name)
      `)
      .eq("id", responseId)
      .single();

    if (responseError) {
      console.error("Error fetching response details:", responseError);
      throw new Error(responseError.message);
    }

    // Get all rates for this response
    const { data: rates, error: ratesError } = await supabase
      .from("carrier_route_rates")
      .select("*")
      .eq("response_id", responseId);

    if (ratesError) {
      console.error("Error fetching route rates:", ratesError);
      throw new Error(ratesError.message);
    }

    return {
      ...response,
      rates: rates || []
    };
  } catch (error: any) {
    console.error("Error in getBidResponseDetails:", error);
    throw error;
  }
};

// Export all responses for a bid to CSV format
export const exportBidResponses = async (bidId: string, routes: any[]) => {
  try {
    // Get all responses with carrier info
    const { data: responses, error: responsesError } = await supabase
      .from("carrier_bid_responses")
      .select(`
        id,
        bid_id,
        carrier_id,
        responder_name,
        responder_email,
        submitted_at,
        carriers(name)
      `)
      .eq("bid_id", bidId);

    if (responsesError) {
      console.error("Error fetching responses for export:", responsesError);
      throw new Error(responsesError.message);
    }

    if (!responses || responses.length === 0) {
      return null; // No responses to export
    }

    // Get all rates for all responses
    const { data: allRates, error: ratesError } = await supabase
      .from("carrier_route_rates")
      .select(`
        id,
        bid_id,
        carrier_id,
        route_id,
        response_id,
        value,
        currency,
        comment
      `)
      .eq("bid_id", bidId)
      .in("response_id", responses.map(r => r.id));

    if (ratesError) {
      console.error("Error fetching rates for export:", ratesError);
      throw new Error(ratesError.message);
    }

    // Create a flat structure for CSV export
    const exportData = [];
    
    for (const response of responses) {
      const responseRates = allRates?.filter(r => r.response_id === response.id) || [];
      
      // For each route, add a row
      for (const route of routes) {
        const rate = responseRates.find(r => r.route_id === route.id);
        
        exportData.push({
          "Carrier Name": response.carriers?.name || 'Unknown Carrier',
          "Responder Name": response.responder_name,
          "Responder Email": response.responder_email,
          "Submitted At": new Date(response.submitted_at).toLocaleString(),
          "Origin": route.origin_city,
          "Destination": route.destination_city,
          "Equipment": route.equipment_type,
          "Commodity": route.commodity,
          "Rate": rate?.value || "Not provided",
          "Currency": rate?.currency || "USD",
          "Comments": rate?.comment || ""
        });
      }
    }

    return exportData;
  } catch (error: any) {
    console.error("Error in exportBidResponses:", error);
    throw error;
  }
};
