
import { supabase } from "@/integrations/supabase/client";
import { Route } from "@/types/route";
import { BidResponseFormValues, BidResponseSubmission, RouteRateSubmission } from "@/types/bidResponse";
import { Json } from "@/integrations/supabase/types";

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
    
    if (invitationToken) {
      console.log("[getBidResponseDetails] Adding invitation token to response query");
      query = query.setHeader('invitation-token', invitationToken);
    }

    const { data: response, error: responseError } = await query;
    
    if (responseError) {
      console.error("[getBidResponseDetails] Error fetching response:", responseError);
      throw responseError;
    }
    
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
    const responses = await getBidResponses(bidId, invitationToken);
    
    if (!responses || responses.length === 0) {
      return [];
    }
    
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
    
    const exportData = responseDetails
      .filter(Boolean)
      .flatMap(response => {
        const rates = response?.rates || [];
        
        if (rates.length === 0) {
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

export const getExistingResponse = async (bidId: string, carrierId: string, invitationId?: string) => {
  console.log("[getExistingResponse] Checking for existing response for bid:", bidId, "carrier:", carrierId);
  
  try {
    let query = supabase
      .from("carrier_bid_responses")
      .select("*")
      .eq("bid_id", bidId)
      .eq("carrier_id", carrierId)
      .order("version", { ascending: false })
      .limit(1);
      
    if (invitationId) {
      query = query.eq("invitation_id", invitationId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("[getExistingResponse] Error fetching response:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("[getExistingResponse] No existing response found");
      return null;
    }
    
    const response = data[0];
    console.log("[getExistingResponse] Found existing response:", response.id);
    
    const { data: ratesData, error: ratesError } = await supabase
      .from("carrier_route_rates")
      .select("*")
      .eq("response_id", response.id);
      
    if (ratesError) {
      console.error("[getExistingResponse] Error fetching rates:", ratesError);
      throw ratesError;
    }
    
    const rates = {};
    ratesData?.forEach(rate => {
      rates[rate.route_id] = {
        id: rate.id,
        value: rate.value,
        currency: rate.currency,
        comment: rate.comment
      };
    });
    
    return {
      ...response,
      rates
    };
  } catch (err) {
    console.error("[getExistingResponse] Error:", err);
    throw err;
  }
};

export const submitBidResponse = async (
  bidId: string,
  carrierId: string,
  invitationId: string,
  formValues: BidResponseFormValues,
  isDraft: boolean = false
) => {
  console.log("[submitBidResponse] Submitting response for bid:", bidId, "carrier:", carrierId, "isDraft:", isDraft);
  
  try {
    const existingResponse = await getExistingResponse(bidId, carrierId, invitationId);
    const version = existingResponse ? existingResponse.version + 1 : 1;
    
    const { data: bidData, error: bidError } = await supabase
      .from("bids")
      .select("org_id")
      .eq("id", bidId)
      .single();
      
    if (bidError) {
      console.error("[submitBidResponse] Error fetching bid:", bidError);
      throw bidError;
    }
    
    const organizationId = bidData.org_id;
    
    const routeRates = Object.entries(formValues.routeRates)
      .filter(([_, rate]) => rate.value !== null && rate.value !== undefined)
      .reduce<Record<string, RouteRateSubmission>>((acc, [routeId, rate]) => {
        acc[routeId] = {
          route_id: routeId,
          value: rate.value as number, // TypeScript can't infer this is non-null at this point
          currency: "USD",
          comment: rate.comment
        };
        return acc;
      }, {});
      
    const routesSubmitted = Object.keys(routeRates).length;
    
    const requestData: BidResponseSubmission = {
      bid_id: bidId,
      carrier_id: carrierId,
      invitation_id: invitationId,
      organization_id: organizationId,
      responder_name: formValues.responderName,
      responder_email: formValues.responderEmail,
      version,
      routes_submitted: routesSubmitted,
      is_draft: isDraft
    };
    
    const { data: insertedData, error: responseError } = await supabase
      .from("carrier_bid_responses")
      .insert(requestData)
      .select()
      .single();
      
    if (responseError) {
      console.error("[submitBidResponse] Error creating response:", responseError);
      throw responseError;
    }
    
    const responseId = insertedData.id;
    console.log("[submitBidResponse] Response created with ID:", responseId);
    
    if (routesSubmitted > 0) {
      const ratesForInsertion = Object.entries(routeRates).map(([routeId, rate]) => ({
        route_id: routeId,
        value: rate.value,
        currency: rate.currency,
        comment: rate.comment,
        bid_id: bidId,
        carrier_id: carrierId,
        organization_id: organizationId,
        response_id: responseId,
        version: version
      }));
      
      const { error: ratesError } = await supabase
        .from("carrier_route_rates")
        .insert(ratesForInsertion);
        
      if (ratesError) {
        console.error("[submitBidResponse] Error creating rates:", ratesError);
        throw ratesError;
      }
    }
    
    return {
      ...insertedData,
      rates: routeRates
    };
  } catch (err) {
    console.error("[submitBidResponse] Error:", err);
    throw err;
  }
};
