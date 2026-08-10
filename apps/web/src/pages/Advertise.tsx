import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Rocket, TrendingUp, Wallet, Zap } from "lucide-react";
import type { BoostDuration, PricingConfigDto } from "@kerak/shared";
import { fetchListing } from "../api/listings";
import { createBoostOrder } from "../api/payments";
import { payBoostWithBalance } from "../api/wallet";
import { fetchPricing } from "../api/pricing";
import { fetchMe } from "../api/users";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { openExternalLink } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

interface AdvertiseOption {
  duration: BoostDuration;
  pricingField: keyof PricingConfigDto;
  icon: typeof Zap;
  labelKey: TranslationKey;
  featureKeys: TranslationKey[];
}

const OPTIONS: AdvertiseOption[] = [
  {
    duration: "DAYS_3",
    pricingField: "boostDays3",
    icon: Zap,
    labelKey: "boost.days3",
    featureKeys: ["advertise.feature3Top", "advertise.feature3Quick"],
  },
  {
    duration: "DAYS_7",
    pricingField: "boostDays7",
    icon: TrendingUp,
    labelKey: "boost.days7",
    featureKeys: ["advertise.feature7Top", "advertise.feature7Views"],
  },
  {
    duration: "DAYS_30",
    pricingField: "boostDays30",
    icon: Rocket,
    labelKey: "boost.days30",
    featureKeys: ["advertise.feature30Top", "advertise.feature30Max"],
  },
];

export function Advertise() {
  const { listingId } = useParams<{ listingId: string }>();
  useBackButton(`/listings/${listingId}`);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [pendingDuration, setPendingDuration] = useState<BoostDuration | null>(null);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => fetchListing(listingId!),
    enabled: Boolean(listingId),
  });

  const { data: pricing } = useQuery({ queryKey: ["pricing"], queryFn: fetchPricing });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const boostMutation = useMutation({
    mutationFn: (duration: BoostDuration) => createBoostOrder(listingId!, duration),
    onSuccess: (result) => {
      openExternalLink(result.paymentUrl);
      setPendingDuration(null);
    },
    onError: () => setPendingDuration(null),
  });

  const balanceMutation = useMutation({
    mutationFn: (duration: BoostDuration) => payBoostWithBalance(listingId!, duration),
    onSuccess: (updated) => {
      queryClient.setQueryData(["listing", listingId], updated);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setPendingDuration(null);
    },
    onError: () => setPendingDuration(null),
  });

  const handleBuy = (duration: BoostDuration) => {
    setPendingDuration(duration);
    boostMutation.mutate(duration);
  };

  const handlePayWithBalance = (duration: BoostDuration) => {
    setPendingDuration(duration);
    balanceMutation.mutate(duration);
  };

  if (isLoading) return <Spinner label={t("loading")} />;

  return (
    <div className="page">
      <PageHeader title={t("advertise.title")} subtitle={listing?.title} backTo={`/listings/${listingId}`} />

      {listing && listing.status !== "ACTIVE" && (
        <div className="rounded-xl bg-promo/10 p-3 text-xs text-promo-dark">{t("advertise.pendingNote")}</div>
      )}

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
                  {(pricing?.[opt.pricingField] ?? 0).toLocaleString("uz-UZ")} {t("som")}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {opt.featureKeys.map((key) => (
                  <span key={key} className="flex items-center gap-1.5 text-sm text-ink">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                    {t(key)}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button
                  onClick={() => handleBuy(opt.duration)}
                  disabled={pendingDuration === opt.duration && (boostMutation.isPending || balanceMutation.isPending)}
                  className="btn-primary"
                >
                  {boostMutation.isPending && pendingDuration === opt.duration ? t("sending") : t("advertise.buy")}
                </button>
                {me && me.balance >= (pricing?.[opt.pricingField] ?? Infinity) && (
                  <button
                    onClick={() => handlePayWithBalance(opt.duration)}
                    disabled={pendingDuration === opt.duration && (boostMutation.isPending || balanceMutation.isPending)}
                    aria-label={t("wallet.payWithBalance")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-brand/10 px-4 py-3 text-sm font-semibold text-brand transition active:scale-[0.98] disabled:opacity-50"
                  >
                    <Wallet className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(boostMutation.isError || balanceMutation.isError) && (
        <span className="text-xs text-destructive">
          {balanceMutation.error?.message || t("errorGeneric")}
        </span>
      )}
    </div>
  );
}
