import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import type { PlanTier } from "@kerak/shared";
import { PLAN_LISTINGS_LIMIT, PLAN_PRICING, UNLIMITED_LISTINGS, FREE_LISTINGS_LIMIT } from "@kerak/shared";
import { fetchMe } from "../api/users";
import { createPlanOrder } from "../api/plans";
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
  price: number;
  listingsLimit: number;
  featureKeys: TranslationKey[];
}

const PLAN_CARDS: PlanCardInfo[] = [
  {
    tier: "FREE",
    nameKey: "plans.free",
    icon: ShieldCheck,
    price: 0,
    listingsLimit: FREE_LISTINGS_LIMIT,
    featureKeys: ["plans.featureOneListing"],
  },
  {
    tier: "STANDARD",
    nameKey: "plans.standard",
    icon: Sparkles,
    price: PLAN_PRICING.STANDARD,
    listingsLimit: PLAN_LISTINGS_LIMIT.STANDARD,
    featureKeys: ["plans.featureFiveListings", "plans.featureOneTime", "plans.featureSupport"],
  },
  {
    tier: "BUSINESS",
    nameKey: "plans.business",
    icon: Rocket,
    price: PLAN_PRICING.BUSINESS,
    listingsLimit: PLAN_LISTINGS_LIMIT.BUSINESS,
    featureKeys: ["plans.featureUnlimitedListings", "plans.featureOneTime", "plans.featurePrioritySupport"],
  },
];

export function Plans() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const [pendingTier, setPendingTier] = useState<PlanTier | null>(null);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const orderMutation = useMutation({
    mutationFn: (tier: PlanTier) => createPlanOrder(tier),
    onSuccess: (result) => {
      openExternalLink(result.paymentUrl);
      setPendingTier(null);
    },
    onError: () => setPendingTier(null),
  });

  const handleBuy = (tier: PlanTier) => {
    setPendingTier(tier);
    orderMutation.mutate(tier);
  };

  return (
    <div className="page">
      <PageHeader title={t("plans.title")} subtitle={t("plans.subtitle")} backTo="/profile" />

      <div className="flex flex-col gap-3">
        {PLAN_CARDS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = me != null && me.listingsLimit === plan.listingsLimit;
          const alreadyIncluded = me != null && me.listingsLimit >= plan.listingsLimit;
          const isPurchasable = plan.tier !== "FREE";

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
                {plan.price === 0 ? t("plans.priceFree") : `${plan.price.toLocaleString("uz-UZ")} ${t("som")}`}
              </span>

              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-sm text-ink">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {plan.listingsLimit >= UNLIMITED_LISTINGS
                    ? t("plans.featureUnlimitedListings")
                    : `${plan.listingsLimit} ${t("plans.listingsCountSuffix")}`}
                </span>
                {plan.featureKeys
                  .filter((k) => k !== "plans.featureUnlimitedListings")
                  .map((key) => (
                    <span key={key} className="flex items-center gap-1.5 text-sm text-ink">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {t(key)}
                    </span>
                  ))}
              </div>

              {isPurchasable && !alreadyIncluded && (
                <button
                  onClick={() => handleBuy(plan.tier as PlanTier)}
                  disabled={orderMutation.isPending && pendingTier === plan.tier}
                  className="btn-primary"
                >
                  {orderMutation.isPending && pendingTier === plan.tier ? t("sending") : t("plans.buy")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {orderMutation.isError && (
        <span className="text-xs text-destructive">{t("errorGeneric")}</span>
      )}
      {!me && <Spinner label={t("loading")} />}
    </div>
  );
}
