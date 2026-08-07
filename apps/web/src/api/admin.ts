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
