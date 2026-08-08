import type { ListingDto, SellerProfileDto } from "@kerak/shared";
import { api } from "./client";

export function fetchSellerProfile(sellerId: string) {
  return api.get<SellerProfileDto>(`/sellers/${sellerId}`);
}

export function fetchSellerListings(sellerId: string) {
  return api.get<ListingDto[]>(`/sellers/${sellerId}/listings`);
}
