interface SafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

type TelegramEventType = "themeChanged" | "safeAreaChanged" | "contentSafeAreaChanged";

interface TelegramWebApp {
  initData: string;
  version: string;
  ready(): void;
  expand(): void;
  requestFullscreen?(): void;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  safeAreaInset: SafeAreaInset;
  contentSafeAreaInset: SafeAreaInset;
  BackButton: {
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  HapticFeedback?: {
    impactOccurred(style: "light" | "medium" | "heavy"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
  };
  onEvent(eventType: TelegramEventType, cb: () => void): void;
  offEvent(eventType: TelegramEventType, cb: () => void): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback: (status: "paid" | "cancelled" | "failed" | "pending") => void): void;
  showAlert(message: string, callback?: () => void): void;
  isVersionAtLeast(version: string): boolean;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

const webApp = window.Telegram?.WebApp;

// Ranglar "R G B" tripleti sifatida saqlanadi, shunda Tailwind'ning
// rgb(var(--x) / <alpha-value>) mexanizmi orqali shaffoflik (masalan
// suzuvchi pastki menyudagi blur effekti) ishlatish mumkin bo'ladi.
const THEME_VAR_MAP: Record<string, string> = {
  bg_color: "--tg-bg",
  secondary_bg_color: "--tg-secondary-bg",
  text_color: "--tg-text",
  hint_color: "--tg-hint",
  link_color: "--tg-link",
  button_color: "--tg-button",
  button_text_color: "--tg-button-text",
  section_bg_color: "--tg-section-bg",
  destructive_text_color: "--tg-destructive",
};

function hexToRgbTriplet(hex: string): string | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return null;
  const [, r, g, b] = match;
  return `${parseInt(r, 16)} ${parseInt(g, 16)} ${parseInt(b, 16)}`;
}

function applyThemeVars(): void {
  if (!webApp) return;
  const root = document.documentElement;
  for (const [tgKey, cssVar] of Object.entries(THEME_VAR_MAP)) {
    const value = webApp.themeParams[tgKey];
    const triplet = value ? hexToRgbTriplet(value) : null;
    if (triplet) root.style.setProperty(cssVar, triplet);
  }
  root.dataset.tgScheme = webApp.colorScheme;
}

function applySafeAreaVars(): void {
  if (!webApp) return;
  const root = document.documentElement;
  const top = (webApp.safeAreaInset?.top ?? 0) + (webApp.contentSafeAreaInset?.top ?? 0);
  root.style.setProperty("--tg-safe-top", `${top}px`);
}

export function initTelegramApp(): void {
  if (!webApp) return;
  webApp.ready();
  webApp.expand();
  if (webApp.requestFullscreen && webApp.isVersionAtLeast("8.0")) {
    try {
      webApp.requestFullscreen();
    } catch {
      // eski klient versiyalarida ushlab qolinadi, oddiy expand() bilan davom etadi
    }
  }
  applyThemeVars();
  applySafeAreaVars();
  webApp.onEvent("themeChanged", applyThemeVars);
  // Fullscreen rejimida Telegram'ning close/menu tugmalari kontent ustiga chiqib
  // qolmasligi uchun - bu qiymatlar fullscreen'ga kirish/chiqishda o'zgaradi.
  webApp.onEvent("safeAreaChanged", applySafeAreaVars);
  webApp.onEvent("contentSafeAreaChanged", applySafeAreaVars);
}

export function getInitData(): string {
  return webApp?.initData ?? "";
}

export function isRunningInTelegram(): boolean {
  return Boolean(webApp?.initData);
}

export function openExternalLink(url: string): void {
  if (webApp) {
    webApp.openLink(url);
  } else {
    window.open(url, "_blank");
  }
}

export function openTelegramLink(url: string): void {
  if (webApp) {
    webApp.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME ?? "";

export function buildListingShareLink(listingId: string): string {
  return BOT_USERNAME ? `https://t.me/${BOT_USERNAME}?start=listing_${listingId}` : window.location.href;
}

export function shareViaTelegram(url: string, text: string): void {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

  if (webApp) {
    webApp.openTelegramLink(shareUrl);
    return;
  }

  if (navigator.share) {
    navigator.share({ title: text, url }).catch(() => {});
    return;
  }

  void navigator.clipboard?.writeText(url);
}

export function shareListing(title: string, listingId: string): void {
  shareViaTelegram(buildListingShareLink(listingId), title);
}

export function buildReferralLink(userId: string): string {
  return BOT_USERNAME ? `https://t.me/${BOT_USERNAME}?start=ref_${userId}` : window.location.href;
}

export function openStarsInvoice(url: string, onDone: (status: "paid" | "cancelled" | "failed" | "pending") => void): void {
  if (webApp) {
    webApp.openInvoice(url, onDone);
  } else {
    window.open(url, "_blank");
  }
}

export function showAlert(message: string): void {
  if (webApp) {
    webApp.showAlert(message);
  } else {
    window.alert(message);
  }
}

export function showBackButton(onClick: () => void): void {
  webApp?.BackButton.show();
  webApp?.BackButton.onClick(onClick);
}

export function hideBackButton(onClick: () => void): void {
  webApp?.BackButton.offClick(onClick);
  webApp?.BackButton.hide();
}

export const telegram = webApp;
