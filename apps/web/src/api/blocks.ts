import type { UserBlockDto } from "@kerak/shared";
import { api } from "./client";

export function fetchMyBlocks() {
  return api.get<UserBlockDto[]>("/blocks");
}

export function checkBlockStatus(userId: string) {
  return api.get<{ isBlocked: boolean }>(`/blocks/${userId}`);
}

export function blockUser(userId: string) {
  return api.post<{ isBlocked: boolean }>(`/blocks/${userId}`);
}

export function unblockUser(userId: string) {
  return api.delete<{ isBlocked: boolean }>(`/blocks/${userId}`);
}
