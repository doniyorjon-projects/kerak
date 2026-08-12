import { ContactEventType } from "@kerak/shared";
import type { CreateListingInput, FeedQuery, ListingDto, PriceHistoryEntryDto } from "@kerak/shared";
import { api } from "./client";

export function fetchListingFeed(query: FeedQuery = {}) {
  const params = new URLSearchParams();
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.lat !== undefined) params.set("lat", String(query.lat));
  if (query.lng !== undefined) params.set("lng", String(query.lng));
  if (query.radiusKm !== undefined) params.set("radiusKm", String(query.radiusKm));
  if (query.sort) params.set("sort", query.sort);
  if (query.q) params.set("q", query.q);
  if (query.boostedOnly) params.set("boostedOnly", "true");
  if (query.regionId !== undefined) params.set("regionId", String(query.regionId));
  if (query.districtId !== undefined) params.set("districtId", String(query.districtId));
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.condition) params.set("condition", query.condition);
  if (query.isFree) params.set("isFree", "true");
  if (query.isUrgent) params.set("isUrgent", "true");
  if (query.hasDelivery) params.set("hasDelivery", "true");
  if (query.sellerType) params.set("sellerType", query.sellerType);
  if (query.attributes && Object.keys(query.attributes).length > 0) {
    params.set("attributes", JSON.stringify(query.attributes));
  }
  if (query.attributesAny && Object.keys(query.attributesAny).length > 0) {
    params.set("attributesAny", JSON.stringify(query.attributesAny));
  }
  if (query.attributesMin && Object.keys(query.attributesMin).length > 0) {
    params.set("attributesMin", JSON.stringify(query.attributesMin));
  }
  if (query.attributesMax && Object.keys(query.attributesMax).length > 0) {
    params.set("attributesMax", JSON.stringify(query.attributesMax));
  }
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.offset !== undefined) params.set("offset", String(query.offset));
  const qs = params.toString();
  return api.get<ListingDto[]>(`/listings${qs ? `?${qs}` : ""}`);
}

export function fetchMyListings() {
  return api.get<ListingDto[]>("/listings/mine");
}

export function fetchListingsByIds(ids: string[]) {
  if (ids.length === 0) return Promise.resolve<ListingDto[]>([]);
  return api.get<ListingDto[]>(`/listings/batch?ids=${ids.join(",")}`);
}

export function fetchListing(id: string) {
  return api.get<ListingDto>(`/listings/${id}`);
}

export function createListing(input: CreateListingInput) {
  return api.post<ListingDto>("/listings", input);
}

export function updateListingStatus(id: string, status: "ACTIVE" | "PAUSED" | "SOLD") {
  return api.patch<ListingDto>(`/listings/${id}`, { status });
}

export function updateListing(id: string, data: Partial<CreateListingInput>) {
  return api.patch<ListingDto>(`/listings/${id}`, data);
}

export function deleteListing(id: string) {
  return api.delete<void>(`/listings/${id}`);
}

export function bumpListing(id: string) {
  return api.post<ListingDto>(`/listings/${id}/bump`);
}

export function logContactEvent(id: string, type: ContactEventType) {
  return api.post<void>(`/listings/${id}/contact-event`, { type });
}

export interface ListingStatsDto {
  viewsCount: number;
  telegramClicks: number;
  phoneClicks: number;
  favoritesCount: number;
  messagesCount: number;
}

export function fetchListingStats(id: string) {
  return api.get<ListingStatsDto>(`/listings/${id}/stats`);
}

export function uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<{ url: string }>("/uploads", formData);
}

export function fetchPriceHistory(id: string) {
  return api.get<PriceHistoryEntryDto[]>(`/listings/${id}/price-history`);
}

export function fetchSimilarListings(id: string) {
  return api.get<ListingDto[]>(`/listings/${id}/similar`);
}
