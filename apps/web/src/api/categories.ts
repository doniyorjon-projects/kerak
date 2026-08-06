import type { CategoryDto, CategoryType } from "@kerak/shared";
import { api } from "./client";

export function fetchCategories() {
  return api.get<CategoryDto[]>("/categories");
}

export function createCategory(data: {
  nameUz: string;
  type: CategoryType;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
}) {
  return api.post<CategoryDto>("/admin/categories", data);
}

export function updateCategory(
  id: string,
  data: Partial<{ nameUz: string; type: CategoryType; icon: string; sortOrder: number }>,
) {
  return api.patch<CategoryDto>(`/admin/categories/${id}`, data);
}

export function deleteCategory(id: string) {
  return api.delete<void>(`/admin/categories/${id}`);
}
