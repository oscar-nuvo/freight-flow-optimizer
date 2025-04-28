
import { useQuery } from "@tanstack/react-query";
import { getRoutesByBid } from "@/services/routeBidService";

export function useRouteBids(bidId: string | undefined) {
  return useQuery({
    queryKey: ['routeBids', bidId],
    queryFn: () => bidId ? getRoutesByBid(bidId) : Promise.resolve([]),
    enabled: !!bidId
  });
}
