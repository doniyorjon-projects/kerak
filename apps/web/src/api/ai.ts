import type { AiCategorySuggestionResultDto, AiDescriptionResultDto } from "@kerak/shared";
import { api } from "./client";

export function generateAiDescription(title: string, categoryName?: string, draft?: string) {
  return api.post<AiDescriptionResultDto>("/ai/description", { title, categoryName, draft });
}

export function suggestCategory(title: string) {
  return api.post<AiCategorySuggestionResultDto>("/ai/suggest-category", { title });
}
