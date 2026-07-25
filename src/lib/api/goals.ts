import { apiClient, unwrap } from "./client";
import type { Goal } from "../types";

export interface GoalPayload {
  name: string;
  target: number;
  saved?: number;
  deadline: string;
}

export const goalsApi = {
  getAll: () =>
    apiClient.get<{ data: Goal[] }>("/goals").then(unwrap),
  create: (body: GoalPayload) =>
    apiClient.post<{ data: Goal }>("/goals", body).then(unwrap),
  update: (id: number, body: Partial<GoalPayload>) =>
    apiClient.put<{ data: Goal }>(`/goals/${id}`, body).then(unwrap),
  delete: (id: number) =>
    apiClient.delete(`/goals/${id}`),
};
