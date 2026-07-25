import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CategoryPayload } from "@/lib/api/categories";
import type { Category } from "@/lib/types";

export const CATEGORIES_KEY = ["categories"] as const;

export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: CATEGORIES_KEY,
    queryFn: categoriesApi.getAll,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CategoryPayload) => categoriesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<CategoryPayload> }) =>
      categoriesApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
