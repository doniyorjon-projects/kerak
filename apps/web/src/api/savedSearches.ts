import type { CreateSavedSearchInput, SavedSearchDto } from "@kerak/shared";
import { api } from "./client";

export function fetchMySavedSearches() {
  return api.get<SavedSearchDto[]>("/saved-searches");
}

export function createSavedSearch(input: CreateSavedSearchInput) {
  return api.post<SavedSearchDto>("/saved-searches", input);
}

export function deleteSavedSearch(id: string) {
  return api.delete<void>(`/saved-searches/${id}`);
}
