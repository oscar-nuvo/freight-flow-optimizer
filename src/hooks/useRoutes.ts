
import { useQuery } from "@tanstack/react-query";
import { getRoutes } from "@/services/routesService";

export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: getRoutes
  });
}
