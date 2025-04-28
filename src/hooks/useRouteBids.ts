
import { useQuery } from "@tanstack/react-query";
import { getRoutesByBid } from "@/services/routesService";
import { Route, EquipmentType } from "@/types/route";

export function useRouteBids(bidId: string | undefined, invitationToken?: string) {
  return useQuery({
    queryKey: ['routeBids', bidId, invitationToken],
    queryFn: async () => {
      if (!bidId) return [];
      
      console.log("UseRouteBids hook: Fetching routes with bidId:", bidId, "invitationToken:", invitationToken ? "present" : "none");
      const routes = await getRoutesByBid(bidId, invitationToken);
      
      // Log what we received
      console.log("UseRouteBids hook: Received routes:", routes?.length || 0);
      
      // Ensure equipment_type is properly typed
      return routes.map(route => ({
        ...route,
        equipment_type: route.equipment_type as EquipmentType
      }));
    },
    enabled: !!bidId
  });
}
