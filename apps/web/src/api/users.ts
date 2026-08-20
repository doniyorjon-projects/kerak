import { api } from "./client";

export interface MeDto {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  regionId: number | null;
  districtId: number | null;
  isAdmin: boolean;
  listingsLimit: number;
  balance: number;
}

export function fetchMe() {
  return api.get<MeDto>("/users/me");
}

export interface ChannelBannerDto {
  show: boolean;
  channelUrl: string | null;
}

export function fetchChannelBanner() {
  return api.get<ChannelBannerDto>("/users/channel-banner");
}

export function updateProfile(data: { firstName?: string; phone?: string }) {
  return api.patch<MeDto>("/users/me", data);
}

export function updateLocation(
  lat: number | null,
  lng: number | null,
  regionId?: number | null,
  districtId?: number | null,
) {
  return api.patch<MeDto>("/users/me", { lat, lng, regionId, districtId });
}
