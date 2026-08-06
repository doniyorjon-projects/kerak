import type { MessageSendResultDto } from "@kerak/shared";
import { api } from "./client";

export function sendListingMessage(listingId: string, text: string) {
  return api.post<MessageSendResultDto>(`/listings/${listingId}/messages`, { text });
}
