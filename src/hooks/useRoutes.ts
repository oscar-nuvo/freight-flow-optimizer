
import { useQuery } from "@tanstack/react-query";
import { getRoutes } from "@/services/routesService";
import { Route, EquipmentType } from "@/types/route";

export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const routes = await getRoutes();
      // Ensure equipment_type is properly typed
      return routes.map(route => ({
        ...route,
        equipment_type: route.equipment_type as EquipmentType
      }));
    }
  });
}
