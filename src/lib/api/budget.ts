import { apiClient, unwrap } from "./client";
import type { Budget } from "../types";

export interface BudgetPayload {
  incomeTarget?: number;
  expenseLimit?: number;
  savingsGoal?: number;
  allocations?: { categoryId: number; percent: number }[];
}

export const budgetApi = {
  get: (): Promise<Budget> =>
    apiClient.get<{ data: Budget; success: boolean; message: string }>("/budget").then(unwrap),
  update: (body: BudgetPayload): Promise<Budget> =>
    apiClient.put<{ data: Budget; success: boolean; message: string }>("/budget", body).then(unwrap),
};
