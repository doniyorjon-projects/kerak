import type { BoostDuration, BotSettingsDto, PlanTier } from "@kerak/shared";
import { api } from "./client";

export interface AdminPendingListing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
  photos: string[];
  createdAt: string;
  seller: { firstName: string; username: string | null; telegramId: string };
  category: { nameUz: string };
}

export interface AdminReport {
  id: string;
  reason: string;
  createdAt: string;
  listing: { id: string; title: string; status: string };
  reporter: { firstName: string; username: string | null };
}

export function fetchPendingListings() {
  return api.get<AdminPendingListing[]>("/admin/listings/pending");
}

export function approveListing(id: string) {
  return api.patch<void>(`/admin/listings/${id}/approve`);
}

export function rejectListing(id: string, reason?: string) {
  return api.patch<void>(`/admin/listings/${id}/reject`, { reason });
}

export function fetchPendingReports() {
  return api.get<AdminReport[]>("/admin/reports");
}

export function resolveReport(id: string) {
  return api.patch<void>(`/admin/reports/${id}/resolve`);
}

export function dismissReport(id: string) {
  return api.patch<void>(`/admin/reports/${id}/dismiss`);
}

export interface AdminUser {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  createdAt: string;
}

export function fetchAdmins() {
  return api.get<AdminUser[]>("/admin/admins");
}

export function addAdmin(identifier: string) {
  return api.post<AdminUser>("/admin/admins", { identifier });
}

export function removeAdmin(id: string) {
  return api.delete<void>(`/admin/admins/${id}`);
}

export interface AdminStats {
  users: { total: number; newToday: number; newThisWeek: number };
  listings: {
    total: number;
    pending: number;
    active: number;
    paused: number;
    sold: number;
    rejected: number;
    newToday: number;
    newThisWeek: number;
  };
  categories: { total: number };
  reports: { pending: number; resolved: number; dismissed: number };
  boosts: { paidCount: number; totalRevenue: number };
  favorites: number;
  messages: number;
}

export function fetchAdminStats() {
  return api.get<AdminStats>("/admin/stats");
}

export interface AdminUserDetail {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  phone: string | null;
  isAdmin: boolean;
  isBlocked: boolean;
  listingsLimit: number;
  createdAt: string;
  listingsCount: number;
  reportsFiledCount: number;
  rating: { avg: number | null; count: number };
}

export function fetchUsers() {
  return api.get<AdminUserDetail[]>("/admin/users");
}

export function blockUser(id: string) {
  return api.patch<AdminUserDetail>(`/admin/users/${id}/block`);
}

export function unblockUser(id: string) {
  return api.patch<AdminUserDetail>(`/admin/users/${id}/unblock`);
}

export function deleteUser(id: string) {
  return api.delete<void>(`/admin/users/${id}`);
}

export function setUserPlan(id: string, tier: PlanTier) {
  return api.patch<AdminUserDetail>(`/admin/users/${id}/plan`, { tier });
}

export function setListingsLimit(id: string, limit: number) {
  return api.patch<AdminUserDetail>(`/admin/users/${id}/listings-limit`, { limit });
}

export function grantBoost(listingId: string, duration: BoostDuration) {
  return api.patch<void>(`/admin/listings/${listingId}/boost`, { duration });
}

export interface AdminUserListing {
  id: string;
  title: string;
  price: number | null;
  isNegotiable: boolean;
  status: string;
  createdAt: string;
  category: { nameUz: string; icon: string | null };
}

export function fetchUserListings(id: string) {
  return api.get<AdminUserListing[]>(`/admin/users/${id}/listings`);
}

export function fetchBotSettings() {
  return api.get<BotSettingsDto>("/admin/settings");
}

export function setChannel(channelId: string | null) {
  return api.patch<BotSettingsDto>("/admin/settings/channel", { channelId });
}

export function setStarsRate(starsRate: number) {
  return api.patch<BotSettingsDto>("/admin/settings/stars-rate", { starsRate });
}

export function refreshUsdRate() {
  return api.post<BotSettingsDto>("/admin/settings/usd-rate/refresh");
}

export function setTelegramChannelUrl(telegramChannelUrl: string | null) {
  return api.patch<BotSettingsDto>("/admin/settings/telegram-channel-url", { telegramChannelUrl });
}

export function setSupportUrl(supportUrl: string | null) {
  return api.patch<BotSettingsDto>("/admin/settings/support-url", { supportUrl });
}

export function setAnthropicApiKey(apiKey: string) {
  return api.patch<BotSettingsDto>("/admin/settings/anthropic-api-key", { apiKey });
}

export interface AdminRequest {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  status: string;
  createdAt: string;
  author: { firstName: string; username: string | null; telegramId: string };
  category: { nameUz: string };
}

export function fetchAllRequestsAdmin() {
  return api.get<AdminRequest[]>("/admin/requests");
}

export function deleteRequestAdmin(id: string) {
  return api.delete<void>(`/admin/requests/${id}`);
}

export interface BroadcastResult {
  sent: number;
  failed: number;
}

export function broadcastMessage(message: string, listingId?: string) {
  return api.post<BroadcastResult>("/admin/broadcast", { message, listingId: listingId || undefined });
}
