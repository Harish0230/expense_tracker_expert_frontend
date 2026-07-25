import { apiClient, unwrap } from "./client";
import type { Notification } from "../types";

export const notificationsApi = {
  getAll: () =>
    apiClient.get<{ data: Notification[] }>("/notifications").then(unwrap),
  markRead: (id: number) =>
    apiClient.patch<{ data: Notification }>(`/notifications/${id}/read`).then(unwrap),
  markAllRead: () =>
    apiClient.patch("/notifications/read-all"),
  clearAll: () =>
    apiClient.delete("/notifications"),
};
