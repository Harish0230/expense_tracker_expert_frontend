import { apiClient, unwrap } from "./client";
import type { DashboardData } from "../types";

export const dashboardApi = {
  get: (): Promise<DashboardData> =>
    apiClient.get<{ data: DashboardData; success: boolean; message: string }>("/dashboard").then(unwrap),
};
