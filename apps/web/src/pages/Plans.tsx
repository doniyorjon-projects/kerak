import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, ChevronRight, CreditCard, Rocket, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import type { PlanTier, PricingConfigDto } from "@kerak/shared";
import { PLAN_LISTINGS_LIMIT, UNLIMITED_LISTINGS, FREE_LISTINGS_LIMIT } from "@kerak/shared";
import { fetchMe } from "../api/users";
import { createPlanOrder } from "../api/plans";
import { payPlanWithBalance } from "../api/wallet";
import { fetchPricing } from "../api/pricing";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { openExternalLink } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

interface PlanCardInfo {
  tier: PlanTier | "FREE";
  nameKey: TranslationKey;
  icon: typeof ShieldCheck;
  pricingField: keyof PricingConfigDto | null;
  listingsLimit: number;
  featureKeys: TranslationKey[];
}

const PLAN_CARDS: PlanCardInfo[] = [
  {
    tier: "FREE",
    nameKey: "plans.free",
    icon: ShieldCheck,
    pricingField: null,
    listingsLimit: FREE_LISTINGS_LIMIT,
    featureKeys: ["plans.featureOneListing"],
  },
  {
    tier: "STANDARD",
    nameKey: "plans.standard",
    icon: Sparkles,
    pricingField: "planStandard",
    listingsLimit: PLAN_LISTINGS_LIMIT.STANDARD,
    featureKeys: ["plans.featureFiveListings", "plans.featureOneTime", "plans.featureSupport", "plans.featureAiDescription"],
  },
  {
    tier: "BUSINESS",
    nameKey: "plans.business",
    icon: Rocket,
    pricingField: "planBusiness",
    listingsLimit: PLAN_LISTINGS_LIMIT.BUSINESS,
    featureKeys: [
      "plans.featureUnlimitedListings",
      "plans.featureOneTime",
      "plans.featurePrioritySupport",
      "plans.featureAiDescription",
    ],
  },
];

export function Plans() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [pendingTier, setPendingTier] = useState<PlanTier | null>(null);
  const [methods, setMethods] = useState<Partial<Record<PlanTier, "click" | "wallet">>>({});

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const { data: pricing } = useQuery({ queryKey: ["pricing"], queryFn: fetchPricing });

  const orderMutation = useMutation({
    mutationFn: (tier: PlanTier) => createPlanOrder(tier),
    onSuccess: (result) => {
      openExternalLink(result.paymentUrl);
      setPendingTier(null);
    },
    onError: () => setPendingTier(null),
  });

  const balanceMutation = useMutation({
    mutationFn: (tier: PlanTier) => payPlanWithBalance(tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setPendingTier(null);
    },
    onError: () => setPendingTier(null),
  });

  const handlePay = (tier: PlanTier) => {
    setPendingTier(tier);
    if (methods[tier] === "wallet") {
      balanceMutation.mutate(tier);
    } else {
      orderMutation.mutate(tier);
    }
  };

  const isPending = (tier: PlanTier) =>
    pendingTier === tier && (orderMutation.isPending || balanceMutation.isPending);

  return (
    <div className="page">
      <PageHeader title={t("plans.title")} subtitle={t("plans.subtitle")} backTo="/profile" />

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
        {PLAN_CARDS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = me != null && me.listingsLimit === plan.listingsLimit;
          const alreadyIncluded = me != null && me.listingsLimit >= plan.listingsLimit;
          const isPurchasable = plan.tier !== "FREE";
          const price = plan.pricingField ? (pricing?.[plan.pricingField] ?? 0) : 0;

          return (
            <div key={plan.tier} className="card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-base font-bold text-ink">
                  <Icon className="h-5 w-5 text-brand" />
                  {t(plan.nameKey)}
                </span>
                {isCurrent && (
                  <span className="pill bg-brand/10 text-brand">{t("plans.current")}</span>
                )}
              </div>

              <span className="text-xl font-bold text-brand">
                {price === 0 ? t("plans.priceFree") : `${price.toLocaleString("uz-UZ")} ${t("som")}`}
              </span>

              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-sm text-ink">
                  <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                  {plan.listingsLimit >= UNLIMITED_LISTINGS
                    ? t("plans.featureUnlimitedListings")
                    : `${plan.listingsLimit} ${t("plans.listingsCountSuffix")}`}
                </span>
                {plan.featureKeys
                  .filter((k) => k !== "plans.featureUnlimitedListings")
                  .map((key) => (
                    <span key={key} className="flex items-center gap-1.5 text-sm text-ink">
                      <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                      {t(key)}
                    </span>
                  ))}
              </div>

              {isPurchasable && !alreadyIncluded && (
                <>
                  {(() => {
                    const tier = plan.tier as PlanTier;
                    const canUseWallet = Boolean(me && me.balance >= price);
                    const method = methods[tier] ?? "click";
                    const remaining = me ? me.balance - price : 0;
                    return (
                      <>
                        <div className="flex gap-1 rounded-xl bg-surface-secondary p-1">
                          <button
                            type="button"
                            onClick={() => setMethods((prev) => ({ ...prev, [tier]: "click" }))}
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
                            onClick={() => setMethods((prev) => ({ ...prev, [tier]: "wallet" }))}
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
                          onClick={() => handlePay(tier)}
                          disabled={isPending(tier)}
                          className="btn-primary disabled:opacity-50"
                        >
                          {isPending(tier) ? t("sending") : t("plans.buy")}
                        </button>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          );
        })}
      </div>

      {(orderMutation.isError || balanceMutation.isError) && (
        <span className="text-xs text-destructive">
          {balanceMutation.error?.message || t("errorGeneric")}
        </span>
      )}
      {!me && <Spinner label={t("loading")} />}
    </div>
  );
}
