import { api } from "./client";

export function fetchAdvertiseContact() {
  return api.get<{ username: string | null; telegramId: string | null }>("/meta/advertise-contact");
}
