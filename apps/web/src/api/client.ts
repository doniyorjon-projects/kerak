import { getInitData } from "../telegram";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("x-telegram-init-data", getInitData());
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

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
