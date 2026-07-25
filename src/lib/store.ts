import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "./types";

// ─── Auth + UI state only — business data lives on the server ────────────────

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  theme: "light" | "dark";
  dateFormat: "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
  notifyBudget: boolean;
  notifyGoals: boolean;
  notifyMonthly: boolean;

  setAuth: (token: string, refreshToken: string, user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
  setSettings: (s: Partial<Pick<AuthState, "dateFormat" | "notifyBudget" | "notifyGoals" | "notifyMonthly">>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      theme: "light",
      dateFormat: "dd/MM/yyyy",
      notifyBudget: true,
      notifyGoals: true,
      notifyMonthly: true,

      setAuth: (token, refreshToken, user) =>
        set({
          token,
          refreshToken,
          user,
          theme: (user.theme as "light" | "dark") ?? "light",
          dateFormat: (user.dateFormat as any) ?? "dd/MM/yyyy",
          notifyBudget: user.notifyBudget ?? true,
          notifyGoals: user.notifyGoals ?? true,
          notifyMonthly: user.notifyMonthly ?? true,
        }),

      setUser: (user) =>
        set({
          user,
          theme: (user.theme as "light" | "dark") ?? "light",
          dateFormat: (user.dateFormat as any) ?? "dd/MM/yyyy",
          notifyBudget: user.notifyBudget ?? true,
          notifyGoals: user.notifyGoals ?? true,
          notifyMonthly: user.notifyMonthly ?? true,
        }),

      logout: () =>
        set({ token: null, refreshToken: null, user: null }),

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),

      setTheme: (t) => set({ theme: t }),

      setSettings: (s) => set((prev) => ({ ...prev, ...s })),
    }),
    { name: "spendwise-auth" }
  )
);

// ── Legacy helper still used in a few places ──────────────────────────────────
export const monthKey = (d: Date | string) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
};
