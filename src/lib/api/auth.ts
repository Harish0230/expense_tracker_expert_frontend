import { apiClient, unwrap } from "./client";
import type { AuthResponse, UserProfile } from "../types";

export const authApi = {
  register: (body: { name: string; email: string; phone?: string; password: string }) =>
    apiClient.post<{ data: AuthResponse; success: boolean; message: string }>("/auth/register", body).then(unwrap),

  login: (body: { email: string; password: string }) =>
    apiClient.post<{ data: AuthResponse; success: boolean; message: string }>("/auth/login", body).then(unwrap),

  refresh: (refreshToken: string) =>
    apiClient.post<{ data: AuthResponse; success: boolean; message: string }>("/auth/refresh", { refreshToken }).then(unwrap),

  getProfile: () =>
    apiClient.get<{ data: UserProfile; success: boolean; message: string }>("/user/profile").then(unwrap),

  updateProfile: (body: { name?: string; email?: string; phone?: string }) =>
    apiClient.put<{ data: UserProfile; success: boolean; message: string }>("/user/profile", body).then(unwrap),

  updateSettings: (body: {
    theme?: string;
    dateFormat?: string;
    notifyBudget?: boolean;
    notifyGoals?: boolean;
    notifyMonthly?: boolean;
  }) => apiClient.put<{ data: UserProfile; success: boolean; message: string }>("/user/settings", body).then(unwrap),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiClient.put("/user/change-password", body),
};
