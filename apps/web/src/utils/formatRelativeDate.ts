import type { TranslationKey } from "../i18n/translations";

type Translate = (key: TranslationKey) => string;

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatRelativeDate(dateStr: string, t: Translate, lang: "uz" | "ru" = "uz"): string {
  const date = new Date(dateStr);
  const now = new Date();
  const time = date.toLocaleTimeString(lang === "ru" ? "ru-RU" : "uz-UZ", { hour: "2-digit", minute: "2-digit" });

  if (isSameDay(date, now)) return t("date.today").replace("{time}", time);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return t("date.yesterday").replace("{time}", time);

  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays < 7) return t("date.daysAgo").replace("{n}", String(diffDays));
  if (diffDays < 30) return t("date.weeksAgo").replace("{n}", String(Math.floor(diffDays / 7)));
  if (diffDays < 365) return t("date.monthsAgo").replace("{n}", String(Math.floor(diffDays / 30)));
  return t("date.yearsAgo").replace("{n}", String(Math.floor(diffDays / 365)));
}
