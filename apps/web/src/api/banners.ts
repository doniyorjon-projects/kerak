import type { BannerDto } from "@kerak/shared";
import { api } from "./client";

export function fetchBanners() {
  return api.get<BannerDto[]>("/banners");
}

export function fetchAllBannersAdmin() {
  return api.get<BannerDto[]>("/admin/banners");
}

export function createBanner(data: { imageUrl: string; linkUrl?: string | null; sortOrder?: number }) {
  return api.post<BannerDto>("/admin/banners", data);
}

export function updateBanner(id: string, data: Partial<{ imageUrl: string; linkUrl: string | null; isActive: boolean; sortOrder: number }>) {
  return api.patch<BannerDto>(`/admin/banners/${id}`, data);
}

export function deleteBanner(id: string) {
  return api.delete<void>(`/admin/banners/${id}`);
}
