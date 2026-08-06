import type { NotificationDto } from "@kerak/shared";
import { api } from "./client";

export function fetchNotifications() {
  return api.get<NotificationDto[]>("/notifications");
}

export function fetchUnreadCount() {
  return api.get<{ count: number }>("/notifications/unread-count");
}

export function markNotificationRead(id: string) {
  return api.patch<{ ok: boolean }>(`/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return api.patch<{ ok: boolean }>("/notifications/read-all");
}
