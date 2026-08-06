import { api } from "./client";

export interface AdminPendingListing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
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

export function rejectListing(id: string) {
  return api.patch<void>(`/admin/listings/${id}/reject`);
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
