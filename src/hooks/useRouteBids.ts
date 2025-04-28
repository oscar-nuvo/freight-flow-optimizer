
import { useQuery } from "@tanstack/react-query";
import { getRoutesByBid } from "@/services/routesService";
import { Route, EquipmentType } from "@/types/route";

export function useRouteBids(bidId: string | undefined, invitationToken?: string) {
  return useQuery({
    queryKey: ['routeBids', bidId, invitationToken],
    queryFn: async () => {
      if (!bidId) {
        console.log("UseRouteBids hook: No bidId provided, returning empty array");
        return [];
      }
      
      console.log("UseRouteBids hook: Fetching routes with bidId:", bidId, "invitationToken:", invitationToken ? "present" : "none");
      
      try {
        const routes = await getRoutesByBid(bidId, invitationToken);
        
        // Log what we received
        console.log("UseRouteBids hook: Received routes:", routes?.length || 0);
        
        if (!routes || !Array.isArray(routes)) {
          console.warn("UseRouteBids hook: Invalid routes data received", routes);
          return [];
        }
        
        // Ensure equipment_type is properly typed
        return routes.map(route => ({
          ...route,
          equipment_type: route.equipment_type as EquipmentType
        }));
      } catch (error) {
        console.error("UseRouteBids hook: Error fetching routes:", error);
        throw error; // Propagate error to be handled by React Query's error state
      }
    },
    enabled: !!bidId,
    retry: 2 // Retry failed requests up to 2 times
  });
}
