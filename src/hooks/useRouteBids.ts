
import { useQuery } from "@tanstack/react-query";
import { getRoutesByBid } from "@/services/routesService";
import { Route } from "@/types/route";

export function useRouteBids(bidId: string | undefined) {
  return useQuery({
    queryKey: ['routeBids', bidId],
    queryFn: () => bidId ? getRoutesByBid(bidId) : Promise.resolve([]),
    enabled: !!bidId
  });
}
