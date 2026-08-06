interface TelegramWebApp {
  initData: string;
  ready(): void;
  expand(): void;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  BackButton: {
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  HapticFeedback?: {
    impactOccurred(style: "light" | "medium" | "heavy"): void;
  };
  onEvent(eventType: "themeChanged", cb: () => void): void;
  offEvent(eventType: "themeChanged", cb: () => void): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
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

export function initTelegramApp(): void {
  if (!webApp) return;
  webApp.ready();
  webApp.expand();
  applyThemeVars();
  webApp.onEvent("themeChanged", applyThemeVars);
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

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME ?? "";

export function buildListingShareLink(listingId: string): string {
  return BOT_USERNAME ? `https://t.me/${BOT_USERNAME}?start=listing_${listingId}` : window.location.href;
}

export function shareListing(title: string, listingId: string): void {
  const link = buildListingShareLink(listingId);

  if (webApp) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(title)}`;
    webApp.openLink(shareUrl);
    return;
  }

  if (navigator.share) {
    navigator.share({ title, url: link }).catch(() => {});
    return;
  }

  void navigator.clipboard?.writeText(link);
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
