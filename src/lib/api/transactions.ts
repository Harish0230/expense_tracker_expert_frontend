import { apiClient, unwrap } from "./client";
import type { Transaction } from "../types";

export interface TransactionPayload {
  title: string;
  amount: number;
  type: "income" | "expense";
  categoryId: number;
  notes?: string;
  date: string;
}

export const transactionsApi = {
  getAll: (start?: string, end?: string): Promise<Transaction[]> => {
    const params: Record<string, string> = {};
    if (start) params.start = start;
    if (end) params.end = end;
    return apiClient.get<{ data: Transaction[] }>("/transactions", { params }).then(unwrap);
  },
  getById: (id: number): Promise<Transaction> =>
    apiClient.get<{ data: Transaction }>(`/transactions/${id}`).then(unwrap),
  create: (body: TransactionPayload): Promise<Transaction> =>
    apiClient.post<{ data: Transaction }>("/transactions", body).then(unwrap),
  update: (id: number, body: Partial<TransactionPayload>): Promise<Transaction> =>
    apiClient.put<{ data: Transaction }>(`/transactions/${id}`, body).then(unwrap),
  delete: (id: number) =>
    apiClient.delete(`/transactions/${id}`),
};
