import type { CategoryDto } from "@kerak/shared";
import { api } from "./client";

export function fetchCategories() {
  return api.get<CategoryDto[]>("/categories");
}
