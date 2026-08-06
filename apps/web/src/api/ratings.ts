import type { RatingSummaryDto } from "@kerak/shared";
import { api } from "./client";

export interface RatingDto {
  id: string;
  stars: number;
  comment: string | null;
}

export function fetchSellerRatingSummary(sellerId: string) {
  return api.get<RatingSummaryDto>(`/sellers/${sellerId}/rating-summary`);
}

export function fetchMyRating(listingId: string) {
  return api.get<RatingDto | null>(`/listings/${listingId}/ratings/me`);
}

export function rateListing(listingId: string, stars: number, comment?: string) {
  return api.post<RatingDto>(`/listings/${listingId}/ratings`, { stars, comment });
}
