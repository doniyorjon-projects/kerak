import { createHmac } from "crypto";

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  username?: string;
}

interface ParsedInitData {
  user: TelegramWebAppUser;
  authDate: number;
}

/**
 * Telegram WebApp initData'ni tekshiradi (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app).
 * Muvaffaqiyatsiz bo'lsa null qaytaradi.
 */
export function verifyTelegramInitData(initData: string, botToken: string): ParsedInitData | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) return null;

  const userRaw = params.get("user");
  const authDate = Number(params.get("auth_date") ?? 0);
  if (!userRaw) return null;

  const user = JSON.parse(userRaw) as TelegramWebAppUser;
  return { user, authDate };
}
