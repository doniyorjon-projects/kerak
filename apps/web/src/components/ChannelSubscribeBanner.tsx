import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, X } from "lucide-react";
import { fetchChannelBanner } from "../api/users";
import { openTelegramLink } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";

/**
 * Backend "show: true" qaytarsa - foydalanuvchi kanalga a'zo emas va bugun
 * hali ko'rsatilmagan (server tomonda bir kunlik cheklov bilan belgilanadi,
 * shu chaqiruvning o'zi allaqachon "ko'rsatildi" deb hisoblanadi). Shuning
 * uchun bu yerda faqat sahifa ichida vaqtincha yopish holatini saqlaymiz.
 */
export function ChannelSubscribeBanner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const { data } = useQuery({
    queryKey: ["channel-banner"],
    queryFn: fetchChannelBanner,
    staleTime: Infinity,
  });

  if (!data?.show || !data.channelUrl || dismissed) return null;

  const handleJoin = () => {
    openTelegramLink(data.channelUrl!);
    setDismissed(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 motion-safe:animate-[backdrop-fade-in_0.2s_ease-out]"
        onClick={() => setDismissed(true)}
      />
      <div className="relative z-10 flex max-h-[55vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-app motion-safe:animate-[sheet-slide-up_0.28s_cubic-bezier(0.16,1,0.3,1)]">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t("cancel")}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="panel-promo flex flex-col items-center justify-center gap-3 px-6 py-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Megaphone className="h-8 w-8 text-white" strokeWidth={1.75} />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5 text-center">
            <h2 className="text-lg font-bold text-ink">{t("channelBanner.title")}</h2>
            <p className="text-sm text-hint">{t("channelBanner.description")}</p>
          </div>
          <button type="button" onClick={handleJoin} className="btn-primary py-3.5 text-base">
            <Megaphone className="h-4 w-4" />
            {t("channelBanner.cta")}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-center text-sm font-medium text-hint active:opacity-70"
          >
            {t("channelBanner.later")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
