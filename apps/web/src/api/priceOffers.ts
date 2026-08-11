import type { PriceOfferDto } from "@kerak/shared";
import { api } from "./client";

export function createPriceOffer(listingId: string, amount: number) {
  return api.post<PriceOfferDto>(`/listings/${listingId}/offers`, { amount });
}

export function fetchListingOffers(listingId: string) {
  return api.get<PriceOfferDto[]>(`/listings/${listingId}/offers`);
}

export function fetchMyOffer(listingId: string) {
  return api.get<PriceOfferDto | null>(`/listings/${listingId}/offers/mine`);
}

export function resolvePriceOffer(offerId: string, accept: boolean) {
  return api.patch<PriceOfferDto>(`/offers/${offerId}`, { accept });
}
