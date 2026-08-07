import type { CreateRequestInput, RequestDto, RequestFeedQuery } from "@kerak/shared";
import { api } from "./client";

export function fetchRequestFeed(query: RequestFeedQuery = {}) {
  const params = new URLSearchParams();
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.regionId !== undefined) params.set("regionId", String(query.regionId));
  if (query.districtId !== undefined) params.set("districtId", String(query.districtId));
  if (query.q) params.set("q", query.q);
  const qs = params.toString();
  return api.get<RequestDto[]>(`/requests${qs ? `?${qs}` : ""}`);
}

export function fetchMyRequests() {
  return api.get<RequestDto[]>("/requests/mine");
}

export function fetchRequest(id: string) {
  return api.get<RequestDto>(`/requests/${id}`);
}

export function createRequest(input: CreateRequestInput) {
  return api.post<RequestDto>("/requests", input);
}

export function updateRequest(id: string, data: Partial<CreateRequestInput> & { status?: "ACTIVE" | "CLOSED" }) {
  return api.patch<RequestDto>(`/requests/${id}`, data);
}

export function deleteRequest(id: string) {
  return api.delete<void>(`/requests/${id}`);
}
