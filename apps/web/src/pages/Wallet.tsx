import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, Copy, Share2, Star, Wallet as WalletIcon } from "lucide-react";
import { REFERRAL_BONUS_AMOUNT } from "@kerak/shared";
import { fetchWallet, topupWithClick, topupWithStars } from "../api/wallet";
import { fetchMe } from "../api/users";
import { PriceInput } from "../components/PriceInput";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { buildReferralLink, openExternalLink, openStarsInvoice, shareViaTelegram } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

const TX_LABELS: Record<string, TranslationKey> = {
  TOPUP_CLICK: "wallet.txTopupClick",
  TOPUP_STARS: "wallet.txTopupStars",
  REFERRAL_BONUS: "wallet.txReferral",
  BOOST_PURCHASE: "wallet.txBoost",
  PLAN_PURCHASE: "wallet.txPlan",
};

export function Wallet() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const { data: wallet, isLoading } = useQuery({ queryKey: ["wallet"], queryFn: fetchWallet });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["wallet"] });

  const clickMutation = useMutation({
    mutationFn: () => topupWithClick(Number(amount)),
    onSuccess: (result) => openExternalLink(result.paymentUrl),
  });

  const starsMutation = useMutation({
    mutationFn: () => topupWithStars(Number(amount)),
    onSuccess: (result) => {
      openStarsInvoice(result.invoiceLink, (status) => {
        if (status === "paid") {
          setAmount("");
          invalidate();
        }
      });
    },
  });

  const referralLink = me ? buildReferralLink(me.id) : "";

  const handleCopyLink = () => {
    void navigator.clipboard?.writeText(referralLink);
    setCopyStatus(t("wallet.linkCopied"));
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleShareLink = () => {
    shareViaTelegram(referralLink, t("wallet.shareText"));
  };

  const amountValid = Number(amount) >= 1000;

  return (
    <div className="page">
      <PageHeader title={t("wallet.title")} backTo="/profile" />

      {isLoading && <Spinner label={t("loading")} />}

      {wallet && (
        <div className="card flex flex-col items-center gap-1 bg-brand py-6 text-brand-contrast">
          <WalletIcon className="h-6 w-6 opacity-80" />
          <span className="text-3xl font-bold">{wallet.balance.toLocaleString("uz-UZ")}</span>
          <span className="text-xs opacity-80">{t("som")}</span>
        </div>
      )}

      <div className="card flex flex-col gap-3">
        <span className="section-title">{t("wallet.topup")}</span>
        <PriceInput value={amount} onChange={setAmount} placeholder="10 000" />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => clickMutation.mutate()}
            disabled={!amountValid || clickMutation.isPending}
            className="btn-secondary disabled:opacity-50"
          >
            {clickMutation.isPending ? t("sending") : "Click"}
          </button>
          <button
            onClick={() => starsMutation.mutate()}
            disabled={!amountValid || starsMutation.isPending}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-promo/10 px-4 py-3 text-sm font-semibold text-promo-dark transition active:scale-[0.98] disabled:opacity-50"
          >
            <Star className="h-4 w-4" />
            {starsMutation.isPending ? t("sending") : "Stars"}
          </button>
        </div>
        {!amountValid && amount.length > 0 && (
          <span className="text-xs text-destructive">{t("wallet.minAmount")}</span>
        )}
        {(clickMutation.isError || starsMutation.isError) && (
          <span className="text-xs text-destructive">{t("errorGeneric")}</span>
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <span className="section-title">{t("wallet.referralTitle")}</span>
        <p className="text-xs text-hint">
          {t("wallet.referralHint").replace("{amount}", REFERRAL_BONUS_AMOUNT.toLocaleString("uz-UZ"))}
        </p>
        <div className="flex items-center gap-2 rounded-xl bg-surface-secondary px-3 py-2.5">
          <span className="flex-1 truncate text-xs text-hint">{referralLink}</span>
          <button onClick={handleCopyLink} aria-label={t("wallet.copyLink")}>
            <Copy className="h-4 w-4 text-hint" />
          </button>
        </div>
        {copyStatus && <span className="text-xs text-success">{copyStatus}</span>}
        <button onClick={handleShareLink} className="btn-primary">
          <Share2 className="h-4 w-4" />
          {t("wallet.shareLink")}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="section-title">{t("wallet.history")}</span>
        {wallet?.transactions.length === 0 && <EmptyState icon={WalletIcon} title={t("wallet.historyEmpty")} />}
        {wallet?.transactions.map((tx) => (
          <div key={tx.id} className="card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${tx.amount >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
              >
                {tx.amount >= 0 ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-ink">{t(TX_LABELS[tx.type] ?? "wallet.txOther")}</span>
                {tx.note && <span className="text-xs text-hint">{tx.note}</span>}
              </div>
            </div>
            <span className={`text-sm font-semibold ${tx.amount >= 0 ? "text-success" : "text-destructive"}`}>
              {tx.amount >= 0 ? "+" : ""}
              {tx.amount.toLocaleString("uz-UZ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
