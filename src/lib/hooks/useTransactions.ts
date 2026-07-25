import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi, type TransactionPayload } from "@/lib/api/transactions";
import type { Transaction } from "@/lib/types";

export const TRANSACTIONS_KEY = ["transactions"] as const;

export function useTransactions(start?: string, end?: string) {
  return useQuery<Transaction[], Error>({
    queryKey: [...TRANSACTIONS_KEY, start, end],
    queryFn: () => transactionsApi.getAll(start, end),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TransactionPayload) => transactionsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<TransactionPayload> }) =>
      transactionsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transactionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}
