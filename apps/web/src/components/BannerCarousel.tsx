import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon } from "lucide-react";
import { fetchBanners } from "../api/banners";
import { fetchAdvertiseContact } from "../api/meta";
import { openSmartLink, openTelegramLink } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";

const ROTATE_MS = 4000;

export function BannerCarousel() {
  const { t } = useTranslation();
  const { data: banners } = useQuery({ queryKey: ["banners"], queryFn: fetchBanners });
  const { data: contact } = useQuery({ queryKey: ["advertise-contact"], queryFn: fetchAdvertiseContact });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => setIndex((i) => (i + 1) % banners.length), ROTATE_MS);
    return () => clearInterval(interval);
  }, [banners]);

  const current = banners?.[index];

  const handleAdvertiseClick = () => {
    if (contact?.username) openTelegramLink(`https://t.me/${contact.username}`);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div
        onClick={() => current?.linkUrl && openSmartLink(current.linkUrl)}
        className={`relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-surface-secondary shadow-soft ${current?.linkUrl ? "cursor-pointer" : ""}`}
      >
        {current ? (
          <img
            key={current.id}
            src={current.imageUrl}
            className="h-full w-full object-cover"
            alt=""
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-hint" strokeWidth={1.5} />
          </div>
        )}
        {banners && banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {banners.map((b, i) => (
              <span
                key={b.id}
                className={`h-1.5 w-1.5 rounded-full transition ${i === index ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleAdvertiseClick}
        className="text-center text-[11px] text-hint active:underline"
      >
        {t("home.advertiseHere")}
      </button>
    </div>
  );
}
