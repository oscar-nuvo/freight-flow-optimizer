import { useQuery } from "@tanstack/react-query";
import { getQuickTasks } from "@/services/quickTasksService";

export const useQuickTasks = () => {
  return useQuery({
    queryKey: ["quick-tasks"],
    queryFn: getQuickTasks,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
};