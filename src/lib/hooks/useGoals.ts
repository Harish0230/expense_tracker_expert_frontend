import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsApi, type GoalPayload } from "@/lib/api/goals";

export const GOALS_KEY = ["goals"] as const;

export function useGoals() {
  return useQuery({ queryKey: GOALS_KEY, queryFn: goalsApi.getAll });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GoalPayload) => goalsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<GoalPayload> }) =>
      goalsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => goalsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}
