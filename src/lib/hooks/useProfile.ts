import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store";

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (body: { name?: string; email?: string; phone?: string }) =>
      authApi.updateProfile(body),
    onSuccess: (user) => setUser(user),
  });
}

export function useUpdateSettings() {
  const setUser = useAuthStore((s) => s.setUser);
  const setSettings = useAuthStore((s) => s.setSettings);
  return useMutation({
    mutationFn: (body: {
      theme?: string;
      dateFormat?: string;
      notifyBudget?: boolean;
      notifyGoals?: boolean;
      notifyMonthly?: boolean;
    }) => authApi.updateSettings(body),
    onSuccess: (user) => {
      setUser(user);
      setSettings({
        dateFormat: user.dateFormat as any,
        notifyBudget: user.notifyBudget,
        notifyGoals: user.notifyGoals,
        notifyMonthly: user.notifyMonthly,
      });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(body),
  });
}
