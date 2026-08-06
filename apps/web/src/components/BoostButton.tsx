import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
import { BOOST_PRICING } from "@kerak/shared";
import type { BoostDuration } from "@kerak/shared";
import { createBoostOrder } from "../api/payments";
import { openExternalLink } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

const OPTIONS: { duration: BoostDuration; labelKey: TranslationKey }[] = [
  { duration: "DAYS_3", labelKey: "boost.days3" },
  { duration: "DAYS_7", labelKey: "boost.days7" },
  { duration: "DAYS_30", labelKey: "boost.days30" },
];

export function BoostButton({ listingId }: { listingId: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const boostMutation = useMutation({
    mutationFn: (duration: BoostDuration) => createBoostOrder(listingId, duration),
    onSuccess: (result) => {
      openExternalLink(result.paymentUrl);
      setOpen(false);
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => setOpen((v) => !v)} className="pill w-fit bg-amber-500/10 text-amber-500">
        <Rocket className="mr-1 inline h-3.5 w-3.5" />
        {t("boost.button")}
      </button>
      {open && (
        <div className="flex flex-wrap gap-2 rounded-xl bg-surface-secondary p-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.duration}
              type="button"
              onClick={() => boostMutation.mutate(opt.duration)}
              disabled={boostMutation.isPending}
              className="rounded-lg border border-divider bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition active:scale-95 disabled:opacity-50"
            >
              {t(opt.labelKey)} — {BOOST_PRICING[opt.duration].toLocaleString("uz-UZ")} {t("som")}
            </button>
          ))}
        </div>
      )}
      {boostMutation.isError && (
        <span className="text-xs text-destructive">{t("errorGeneric")}</span>
      )}
    </div>
  );
}
