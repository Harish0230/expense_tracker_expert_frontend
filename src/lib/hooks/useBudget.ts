import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetApi, type BudgetPayload } from "@/lib/api/budget";
import type { Budget } from "@/lib/types";

export const BUDGET_KEY = ["budget"] as const;

export function useBudget() {
  return useQuery<Budget, Error>({ queryKey: BUDGET_KEY, queryFn: budgetApi.get });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BudgetPayload) => budgetApi.update(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGET_KEY }),
  });
}
