import type { ListingMessageDto, MessageSendResultDto } from "@kerak/shared";
import { api } from "./client";

export function sendListingMessage(listingId: string, text: string) {
  return api.post<MessageSendResultDto>(`/listings/${listingId}/messages`, { text });
}

export function fetchListingMessages(listingId: string) {
  return api.get<ListingMessageDto[]>(`/listings/${listingId}/messages`);
}
