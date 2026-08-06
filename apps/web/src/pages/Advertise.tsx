import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Rocket, TrendingUp, Zap } from "lucide-react";
import { BOOST_PRICING } from "@kerak/shared";
import type { BoostDuration } from "@kerak/shared";
import { fetchListing } from "../api/listings";
import { createBoostOrder } from "../api/payments";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { openExternalLink } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

interface AdvertiseOption {
  duration: BoostDuration;
  icon: typeof Zap;
  labelKey: TranslationKey;
  featureKeys: TranslationKey[];
}

const OPTIONS: AdvertiseOption[] = [
  {
    duration: "DAYS_3",
    icon: Zap,
    labelKey: "boost.days3",
    featureKeys: ["advertise.feature3Top", "advertise.feature3Quick"],
  },
  {
    duration: "DAYS_7",
    icon: TrendingUp,
    labelKey: "boost.days7",
    featureKeys: ["advertise.feature7Top", "advertise.feature7Views"],
  },
  {
    duration: "DAYS_30",
    icon: Rocket,
    labelKey: "boost.days30",
    featureKeys: ["advertise.feature30Top", "advertise.feature30Max"],
  },
];

export function Advertise() {
  const { listingId } = useParams<{ listingId: string }>();
  useBackButton(`/listings/${listingId}`);
  const { t } = useTranslation();
  const [pendingDuration, setPendingDuration] = useState<BoostDuration | null>(null);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => fetchListing(listingId!),
    enabled: Boolean(listingId),
  });

  const boostMutation = useMutation({
    mutationFn: (duration: BoostDuration) => createBoostOrder(listingId!, duration),
    onSuccess: (result) => {
      openExternalLink(result.paymentUrl);
      setPendingDuration(null);
    },
    onError: () => setPendingDuration(null),
  });

  const handleBuy = (duration: BoostDuration) => {
    setPendingDuration(duration);
    boostMutation.mutate(duration);
  };

  if (isLoading) return <Spinner label={t("loading")} />;

  return (
    <div className="page">
      <PageHeader title={t("advertise.title")} subtitle={listing?.title} backTo={`/listings/${listingId}`} />

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <div key={opt.duration} className="card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-base font-bold text-ink">
                  <Icon className="h-5 w-5 text-brand" />
                  {t(opt.labelKey)}
                </span>
                <span className="text-lg font-bold text-brand">
                  {BOOST_PRICING[opt.duration].toLocaleString("uz-UZ")} {t("som")}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {opt.featureKeys.map((key) => (
                  <span key={key} className="flex items-center gap-1.5 text-sm text-ink">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {t(key)}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleBuy(opt.duration)}
                disabled={boostMutation.isPending && pendingDuration === opt.duration}
                className="btn-primary"
              >
                {boostMutation.isPending && pendingDuration === opt.duration ? t("sending") : t("advertise.buy")}
              </button>
            </div>
          );
        })}
      </div>

      {boostMutation.isError && <span className="text-xs text-destructive">{t("errorGeneric")}</span>}
    </div>
  );
}
