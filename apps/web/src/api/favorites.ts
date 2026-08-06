import type { ListingDto } from "@kerak/shared";
import { api } from "./client";

export function fetchFavorites() {
  return api.get<ListingDto[]>("/favorites");
}

export function fetchFavoriteStatus(listingId: string) {
  return api.get<{ isFavorite: boolean }>(`/favorites/${listingId}`);
}

export function addFavorite(listingId: string) {
  return api.post<{ isFavorite: boolean }>(`/favorites/${listingId}`);
}

export function removeFavorite(listingId: string) {
  return api.delete<{ isFavorite: boolean }>(`/favorites/${listingId}`);
}
