import type { BoostDuration, BoostStatusDto, CreateBoostResultDto } from "@kerak/shared";
import { api } from "./client";

export function createBoostOrder(listingId: string, duration: BoostDuration) {
  return api.post<CreateBoostResultDto>(`/listings/${listingId}/boost`, { duration });
}

export function fetchBoostStatus(orderId: string) {
  return api.get<BoostStatusDto>(`/boost-orders/${orderId}`);
}
