import type { AiDescriptionResultDto } from "@kerak/shared";
import { api } from "./client";

export function generateAiDescription(title: string, categoryName?: string, draft?: string) {
  return api.post<AiDescriptionResultDto>("/ai/description", { title, categoryName, draft });
}
