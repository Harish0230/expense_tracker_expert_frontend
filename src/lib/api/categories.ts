import { apiClient, unwrap } from "./client";
import type { Category, CategoryType } from "../types";

export interface CategoryPayload {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export const categoriesApi = {
  getAll: (): Promise<Category[]> =>
    apiClient.get<{ data: Category[]; success: boolean; message: string }>("/categories").then(unwrap),
  create: (body: CategoryPayload): Promise<Category> =>
    apiClient.post<{ data: Category; success: boolean; message: string }>("/categories", body).then(unwrap),
  update: (id: number, body: Partial<CategoryPayload>): Promise<Category> =>
    apiClient.put<{ data: Category; success: boolean; message: string }>(`/categories/${id}`, body).then(unwrap),
  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`),
};
