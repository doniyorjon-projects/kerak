import { api } from "./client";

export interface MeDto {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  isAdmin: boolean;
}

export function fetchMe() {
  return api.get<MeDto>("/users/me");
}

export function updatePhone(phone: string) {
  return api.patch<MeDto>("/users/me", { phone });
}

export function updateLocation(lat: number, lng: number) {
  return api.patch<MeDto>("/users/me", { lat, lng });
}
