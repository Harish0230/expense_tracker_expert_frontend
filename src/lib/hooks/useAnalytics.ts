import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/analytics";

export function useAnalytics(months = 6) {
  return useQuery({
    queryKey: ["analytics", months],
    queryFn: () => analyticsApi.get(months),
  });
}
