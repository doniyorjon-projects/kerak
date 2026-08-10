import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, ChevronRight, CreditCard, Rocket, TrendingUp, Wallet, Zap } from "lucide-react";
import type { BoostDuration, PricingConfigDto } from "@kerak/shared";
import { fetchListing } from "../api/listings";
import { createBoostOrder } from "../api/payments";
import { payBoostWithBalance } from "../api/wallet";
import { fetchPricing } from "../api/pricing";
import { fetchMe } from "../api/users";
import type { MeDto } from "../api/users";
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
  const [methods, setMethods] = useState<Partial<Record<BoostDuration, "click" | "wallet">>>({});
  const [walletSuccessDuration, setWalletSuccessDuration] = useState<BoostDuration | null>(null);

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
    mutationFn: (duration: BoostDuration) => {
      const price = pricing?.[OPTIONS.find((o) => o.duration === duration)!.pricingField] ?? 0;
      return payBoostWithBalance(listingId!, duration).then((listing) => ({ listing, price }));
    },
    onSuccess: ({ listing, price }, duration) => {
      queryClient.setQueryData(["listing", listingId], listing);
      // Serverdan alohida "me" so'rovini kutmasdan, hisoblangan summani
      // darhol keshdan ayiramiz - tarmoq kechikishi tufayli "hech narsa
      // o'zgarmadi" degan taassurot qoldirmaslik uchun.
      queryClient.setQueryData<MeDto>(["me"], (old) => (old ? { ...old, balance: old.balance - price } : old));
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setPendingDuration(null);
      setWalletSuccessDuration(duration);
      setTimeout(() => setWalletSuccessDuration((d) => (d === duration ? null : d)), 4000);
    },
    onError: () => setPendingDuration(null),
  });

  const handlePay = (duration: BoostDuration) => {
    setPendingDuration(duration);
    if (methods[duration] === "wallet") {
      balanceMutation.mutate(duration);
    } else {
      boostMutation.mutate(duration);
    }
  };

  const isPending = (duration: BoostDuration) =>
    pendingDuration === duration && (boostMutation.isPending || balanceMutation.isPending);

  if (isLoading) return <Spinner label={t("loading")} />;

  return (
    <div className="page">
      <PageHeader title={t("advertise.title")} subtitle={listing?.title} backTo={`/listings/${listingId}`} />

      {listing && listing.status !== "ACTIVE" && (
        <div className="rounded-xl bg-promo/10 p-3 text-xs text-promo-dark">{t("advertise.pendingNote")}</div>
      )}

      {me && (
        <Link
          to="/wallet"
          className="card flex items-center gap-3 bg-brand text-brand-contrast transition active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-xs opacity-80">{t("wallet.balanceLabel")}</span>
            <span className="text-lg font-bold">
              {me.balance.toLocaleString("uz-UZ")} {t("som")}
            </span>
          </div>
          <span className="flex items-center gap-0.5 text-xs font-semibold opacity-90">
            {t("wallet.topup")}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const price = pricing?.[opt.pricingField] ?? 0;
          const canUseWallet = Boolean(me && me.balance >= price);
          const method = methods[opt.duration] ?? "click";
          const remaining = me ? me.balance - price : 0;

          return (
            <div key={opt.duration} className="card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-base font-bold text-ink">
                  <Icon className="h-5 w-5 text-brand" />
                  {t(opt.labelKey)}
                </span>
                <span className="text-lg font-bold text-brand">
                  {price.toLocaleString("uz-UZ")} {t("som")}
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

              {walletSuccessDuration === opt.duration && (
                <div className="flex items-center gap-1.5 rounded-xl bg-success/10 px-3 py-2.5 text-xs font-semibold text-success-dark">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  {t("advertise.walletPaidSuccess")}
                </div>
              )}

              <div className="flex gap-1 rounded-xl bg-surface-secondary p-1">
                <button
                  type="button"
                  onClick={() => setMethods((prev) => ({ ...prev, [opt.duration]: "click" }))}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                    method === "click" ? "bg-surface text-ink shadow-soft" : "text-hint"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Click
                </button>
                <button
                  type="button"
                  disabled={!canUseWallet}
                  onClick={() => setMethods((prev) => ({ ...prev, [opt.duration]: "wallet" }))}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition disabled:opacity-40 ${
                    method === "wallet" ? "bg-surface text-ink shadow-soft" : "text-hint"
                  }`}
                >
                  <Wallet className="h-3.5 w-3.5" />
                  {t("wallet.title")}
                  {!canUseWallet && me && ` (${t("wallet.insufficientShort")})`}
                </button>
              </div>

              {method === "wallet" && canUseWallet && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-brand/5 px-3 py-2 text-xs text-hint">
                  <span className="font-semibold text-destructive">
                    -{price.toLocaleString("uz-UZ")} {t("som")}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                  <span>
                    {t("wallet.remainingBalance")}:{" "}
                    <span className="font-semibold text-ink">
                      {remaining.toLocaleString("uz-UZ")} {t("som")}
                    </span>
                  </span>
                </div>
              )}

              <button
                onClick={() => handlePay(opt.duration)}
                disabled={isPending(opt.duration)}
                className="btn-primary disabled:opacity-50"
              >
                {isPending(opt.duration) ? t("sending") : t("advertise.buy")}
              </button>
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
