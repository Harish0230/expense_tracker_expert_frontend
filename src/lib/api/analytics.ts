import { apiClient, unwrap } from "./client";
import type { AnalyticsData } from "../types";

export const analyticsApi = {
  get: (months = 6) =>
    apiClient
      .get<{ data: AnalyticsData; success: boolean; message: string }>("/analytics", {
        params: { months },
      })
      .then(unwrap),
};
