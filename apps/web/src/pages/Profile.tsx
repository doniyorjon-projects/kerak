import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  BellRing,
  Check,
  ChevronRight,
  HeadphonesIcon,
  ListChecks,
  MessageSquareText,
  Pencil,
  Rocket,
  Send,
  ShieldCheck,
  Wallet as WalletIcon,
  X,
} from "lucide-react";
import { UNLIMITED_LISTINGS } from "@kerak/shared";
import { fetchMe, updateProfile } from "../api/users";
import { fetchPublicSettings } from "../api/settings";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { openSmartLink } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";

export function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const { data: publicSettings } = useQuery({ queryKey: ["public-settings"], queryFn: fetchPublicSettings });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (me) {
      setEditName(me.firstName);
      setEditPhone(me.phone ?? "");
    }
  }, [me?.firstName, me?.phone]);

  const profileMutation = useMutation({
    mutationFn: (data: { firstName: string; phone?: string }) => updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      setIsEditingProfile(false);
      setProfileError(null);
    },
    onError: (err: Error) => setProfileError(err.message),
  });

  const startEditingProfile = () => {
    if (me) {
      setEditName(me.firstName);
      setEditPhone(me.phone ?? "");
    }
    setProfileError(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    setProfileError(null);
    profileMutation.mutate({ firstName: editName.trim(), phone: editPhone.trim() || undefined });
  };

  if (isLoading) return <Spinner label={t("loading")} />;
  if (!me) return <div className="p-4 text-center text-destructive">{t("profile.loadError")}</div>;

  return (
    <div className="page">
      <PageHeader title={t("profile.title")} />

      <div className="card flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-brand-contrast">
          {me.firstName.charAt(0).toUpperCase()}
        </div>

        {isEditingProfile ? (
          <div className="flex flex-1 flex-col gap-2">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t("profile.namePlaceholder")}
              className="input"
            />
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="+998901234567"
              className="input"
            />
            {profileError && <span className="text-xs text-destructive">{profileError}</span>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2 text-xs font-semibold text-hint transition active:scale-[0.98]"
              >
                <X className="h-3.5 w-3.5" />
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={editName.trim().length < 2 || profileMutation.isPending}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand py-2 text-xs font-semibold text-brand-contrast transition active:scale-[0.98] disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {profileMutation.isPending ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-col">
              <span className="font-semibold text-ink">{me.firstName}</span>
              <span className="text-sm text-hint">{me.phone || t("profile.noPhone")}</span>
              {me.username && <span className="text-xs text-hint">@{me.username}</span>}
            </div>
            <button
              type="button"
              onClick={startEditingProfile}
              aria-label={t("profile.editProfile")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary"
            >
              <Pencil className="h-4 w-4 text-hint" />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Link to="/my-listings" className="card flex items-center justify-between transition active:scale-[0.98]">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <ListChecks className="h-5 w-5 text-hint" />
            {t("profile.myListings")}
          </span>
          <ChevronRight className="h-4 w-4 text-hint" />
        </Link>

        <Link to="/my-requests" className="card flex items-center justify-between transition active:scale-[0.98]">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <MessageSquareText className="h-5 w-5 text-hint" />
            {t("profile.myRequests")}
          </span>
          <ChevronRight className="h-4 w-4 text-hint" />
        </Link>

        <Link to="/wallet" className="card flex items-center justify-between transition active:scale-[0.98]">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <WalletIcon className="h-5 w-5 text-hint" />
            {t("wallet.title")}
          </span>
          <span className="flex items-center gap-1 text-xs text-hint">
            {me.balance.toLocaleString("uz-UZ")} {t("som")}
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>

        <Link to="/plans" className="card flex items-center justify-between transition active:scale-[0.98]">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <Rocket className="h-5 w-5 text-hint" />
            {t("profile.plan")}
          </span>
          <span className="flex items-center gap-1 text-xs text-hint">
            {me.listingsLimit >= UNLIMITED_LISTINGS ? t("plans.featureUnlimitedListings") : me.listingsLimit}
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>

        <Link to="/saved-searches" className="card flex items-center justify-between transition active:scale-[0.98]">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <BellRing className="h-5 w-5 text-hint" />
            {t("savedSearch.title")}
          </span>
          <ChevronRight className="h-4 w-4 text-hint" />
        </Link>

        <Link to="/blocked-users" className="card flex items-center justify-between transition active:scale-[0.98]">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <Ban className="h-5 w-5 text-hint" />
            {t("blocked.title")}
          </span>
          <ChevronRight className="h-4 w-4 text-hint" />
        </Link>

        {me.isAdmin && (
          <Link to="/admin" className="card flex items-center justify-between transition active:scale-[0.98]">
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <ShieldCheck className="h-5 w-5 text-hint" />
              {t("profile.adminPanel")}
            </span>
            <ChevronRight className="h-4 w-4 text-hint" />
          </Link>
        )}
      </div>

      {(publicSettings?.telegramChannelUrl || publicSettings?.supportUrl) && (
        <div className="card flex flex-col gap-3 border-brand/25 bg-brand/5">
          <span className="text-sm font-semibold text-brand">{t("profile.linksTitle")}</span>
          <div className="grid grid-cols-2 gap-2">
            {publicSettings.telegramChannelUrl && (
              <button
                type="button"
                onClick={() => openSmartLink(publicSettings.telegramChannelUrl!)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-brand py-3 text-xs font-semibold text-brand-contrast transition active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                {t("profile.channelLink")}
              </button>
            )}
            {publicSettings.supportUrl && (
              <button
                type="button"
                onClick={() => openSmartLink(publicSettings.supportUrl!)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-brand py-3 text-xs font-semibold text-brand-contrast transition active:scale-[0.98]"
              >
                <HeadphonesIcon className="h-4 w-4" />
                {t("profile.supportLink")}
              </button>
            )}
          </div>
        </div>
      )}

      <p className="pb-2 pt-1 text-center text-[11px] text-hint">
        © {new Date().getFullYear()} {t("profile.copyright")}
      </p>
    </div>
  );
}
