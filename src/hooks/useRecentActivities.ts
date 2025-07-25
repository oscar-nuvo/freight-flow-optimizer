import { useQuery } from "@tanstack/react-query";
import { getRecentActivities, ActivityItem } from "@/services/activityFeedService";

export function useRecentActivities(limit = 10) {
  const query = useQuery<ActivityItem[], Error>({
    queryKey: ["recentActivities", { limit }],
    queryFn: () => getRecentActivities(limit),
    refetchInterval: 30000, // Refetch every 30 seconds for near real-time updates
  });

  return query;
}