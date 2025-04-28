
import { useQuery } from "@tanstack/react-query";
import { getRoutesByBid } from "@/services/routesService";
import { Route, EquipmentType } from "@/types/route";

export function useRouteBids(bidId: string | undefined) {
  return useQuery({
    queryKey: ['routeBids', bidId],
    queryFn: async () => {
      if (!bidId) return [];
      
      const routes = await getRoutesByBid(bidId);
      // Ensure equipment_type is properly typed
      return routes.map(route => ({
        ...route,
        equipment_type: route.equipment_type as EquipmentType
      }));
    },
    enabled: !!bidId
  });
}
