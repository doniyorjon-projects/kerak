import { getInitData } from "../telegram";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const REFERRAL_STORAGE_KEY = "kerak_referral_id";

// Render'ning bepul tarifidagi server uzoq vaqt bo'sh tursa "uxlab qoladi" va
// birinchi so'rovga http://.../502-504 bilan javob berishi yoki ulanishni
// umuman ochmasligi mumkin - bu holatlarda so'rov serverga yetib bormagan
// bo'ladi, shuning uchun qayta yuborish xavfsiz (dublikat yaratish xavfi yo'q).
const GATEWAY_ERROR_STATUSES = new Set([502, 503, 504]);
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("x-telegram-init-data", getInitData());
  const referralId = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (referralId) headers.set("x-referral-id", referralId);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }

    if (GATEWAY_ERROR_STATUSES.has(res.status) && attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : undefined;
    if (!res.ok) {
      throw new Error(data?.message ?? res.statusText ?? "So'rovda xatolik yuz berdi");
    }
    return data as T;
  }
}

export function wakeUpServer(): void {
  // Render'ning bepul tarifi bo'sh serverni uxlatib qo'yadi - mini-app ochilishi
  // bilanoq shu yengil so'rovni yuborib, haqiqiy amal (rasm yuklash, e'lon
  // joylash) vaqtiga qadar server allaqachon uyg'onib ulgurishi ehtimolini
  // oshiramiz.
  fetch(`${API_URL}/health`).catch(() => {});
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
