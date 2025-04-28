import { supabase } from "@/integrations/supabase/client";
import { Route } from "@/types/route";

export const getBidResponses = async (bidId: string, invitationToken?: string) => {
  console.log("[getBidResponses] Starting fetch for bid:", bidId, "token:", invitationToken ? "provided" : "not provided");
  
  try {
    let query = supabase
      .from("carrier_bid_responses")
      .select(`
        *,
        carriers (
          name
        )
      `)
      .eq("bid_id", bidId)
      .order("submitted_at", { ascending: false });
    
    // Add invitation token if provided
    if (invitationToken) {
      console.log("[getBidResponses] Adding invitation token to query");
      query = query.setHeader('invitation-token', invitationToken);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("[getBidResponses] Error fetching responses:", error);
      throw error;
    }
    
    console.log("[getBidResponses] Responses fetched:", data?.length || 0);
    return data || [];
  } catch (err) {
    console.error("[getBidResponses] Error:", err);
    throw err;
  }
};

export const getBidResponseDetails = async (responseId: string, invitationToken?: string) => {
  console.log("[getBidResponseDetails] Fetching details for response:", responseId, "token:", invitationToken ? "provided" : "not provided");
  
  try {
    // First get the response
    let query = supabase
      .from("carrier_bid_responses")
      .select(`
        *,
        carriers (
          name,
          contact_email,
          contact_phone
        )
      `)
      .eq("id", responseId)
      .single();
    
    // Add invitation token if provided
    if (invitationToken) {
      console.log("[getBidResponseDetails] Adding invitation token to response query");
      query = query.setHeader('invitation-token', invitationToken);
    }

    const { data: response, error: responseError } = await query;
    
    if (responseError) {
      console.error("[getBidResponseDetails] Error fetching response:", responseError);
      throw responseError;
    }
    
    // Now get all rates for this response
    let ratesQuery = supabase
      .from("carrier_route_rates")
      .select(`
        *,
        routes (
          id,
          origin_city,
          destination_city,
          equipment_type,
          commodity,
          weekly_volume,
          distance
        )
      `)
      .eq("response_id", responseId)
      .order("submitted_at", { ascending: false });
    
    // Add invitation token if provided
    if (invitationToken) {
      console.log("[getBidResponseDetails] Adding invitation token to rates query");
      ratesQuery = ratesQuery.setHeader('invitation-token', invitationToken);
    }

    const { data: rates, error: ratesError } = await ratesQuery;
    
    if (ratesError) {
      console.error("[getBidResponseDetails] Error fetching rates:", ratesError);
      throw ratesError;
    }
    
    console.log("[getBidResponseDetails] Details fetched - response:", !!response, "rates:", rates?.length || 0);
    
    return {
      ...response,
      rates: rates || []
    };
  } catch (err) {
    console.error("[getBidResponseDetails] Error:", err);
    throw err;
  }
};

export const exportBidResponses = async (bidId: string, routes: Route[], invitationToken?: string) => {
  try {
    // First get all responses
    const responses = await getBidResponses(bidId, invitationToken);
    
    if (!responses || responses.length === 0) {
      return [];
    }
    
    // For each response, get the details
    const responseDetails = await Promise.all(
      responses.map(async (response) => {
        try {
          return await getBidResponseDetails(response.id, invitationToken);
        } catch (error) {
          console.error(`Error getting details for response ${response.id}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null responses and flatten the data
    const exportData = responseDetails
      .filter(Boolean)
      .flatMap(response => {
        // Get rates for this response
        const rates = response?.rates || [];
        
        if (rates.length === 0) {
          // If no rates, still include one row for the carrier
          return [{
            "Carrier Name": response?.carriers?.name || "Unknown",
            "Responder Name": response?.responder_name || "",
            "Responder Email": response?.responder_email || "",
            "Submitted At": response?.submitted_at ? new Date(response.submitted_at).toLocaleString() : "",
            "Origin": "",
            "Destination": "",
            "Rate": "",
            "Equipment Type": "",
            "Commodity": "",
            "Weekly Volume": "",
            "Distance (mi)": ""
          }];
        }
        
        // Otherwise create a row for each rate
        return rates.map(rate => ({
          "Carrier Name": response?.carriers?.name || "Unknown",
          "Responder Name": response?.responder_name || "",
          "Responder Email": response?.responder_email || "",
          "Submitted At": response?.submitted_at ? new Date(response.submitted_at).toLocaleString() : "",
          "Origin": rate.routes?.origin_city || "",
          "Destination": rate.routes?.destination_city || "",
          "Rate": `${rate.value || ""} ${rate.currency || "USD"}`,
          "Equipment Type": rate.routes?.equipment_type || "",
          "Commodity": rate.routes?.commodity || "",
          "Weekly Volume": rate.routes?.weekly_volume || "",
          "Distance (mi)": rate.routes?.distance || ""
        }));
      });
    
    return exportData;
  } catch (error) {
    console.error("Error in exportBidResponses:", error);
    throw error;
  }
};
