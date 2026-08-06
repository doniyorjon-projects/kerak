import { api } from "./client";

export function reportListing(listingId: string, reason: string) {
  return api.post<{ id: string }>(`/listings/${listingId}/reports`, { reason });
}
