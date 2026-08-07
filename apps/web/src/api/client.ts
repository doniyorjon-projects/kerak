import { getInitData } from "../telegram";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const REFERRAL_STORAGE_KEY = "kerak_referral_id";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("x-telegram-init-data", getInitData());
  const referralId = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (referralId) headers.set("x-referral-id", referralId);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    throw new Error(data?.message ?? res.statusText ?? "So'rovda xatolik yuz berdi");
  }
  return data as T;
}

export function captureReferralId(referralId: string): void {
  if (!localStorage.getItem(REFERRAL_STORAGE_KEY)) {
    localStorage.setItem(REFERRAL_STORAGE_KEY, referralId);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
