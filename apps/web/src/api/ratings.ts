import type { RatingSummaryDto } from "@kerak/shared";
import { api } from "./client";

export interface RatingDto {
  id: string;
  stars: number;
  comment: string | null;
}

export interface ListingRatingDto {
  id: string;
  stars: number;
  comment: string | null;
  createdAt: string;
  raterName: string | null;
  sellerReply: string | null;
  sellerRepliedAt: string | null;
}

export function fetchSellerRatingSummary(sellerId: string) {
  return api.get<RatingSummaryDto>(`/sellers/${sellerId}/rating-summary`);
}

export function fetchMyRating(listingId: string) {
  return api.get<RatingDto | null>(`/listings/${listingId}/ratings/me`);
}

export function fetchListingRatings(listingId: string) {
  return api.get<ListingRatingDto[]>(`/listings/${listingId}/ratings`);
}

export function rateListing(listingId: string, stars: number, comment?: string, isAnonymous?: boolean) {
  return api.post<RatingDto>(`/listings/${listingId}/ratings`, { stars, comment, isAnonymous });
}

export function replyToRating(ratingId: string, reply: string) {
  return api.post<ListingRatingDto>(`/ratings/${ratingId}/reply`, { reply });
}
