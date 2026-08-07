import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Heart,
  MapPin,
  Megaphone,
  MessageCircle,
  PauseCircle,
  Pencil,
  Phone,
  PlayCircle,
  Rocket,
  Send,
  Share2,
  Tag,
  Trash2,
  TrendingUp,
  User,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ContactEventType } from "@kerak/shared";
import type { BoostDuration, ListingStatus } from "@kerak/shared";
import { bumpListing, deleteListing, fetchListing, fetchListingStats, logContactEvent, updateListingStatus } from "../api/listings";
import { approveListing, grantBoost, rejectListing } from "../api/admin";
import { fetchMe } from "../api/users";
import { blockUser, checkBlockStatus, unblockUser } from "../api/blocks";
import { addFavorite, fetchFavoriteStatus, removeFavorite } from "../api/favorites";
import { sendListingMessage } from "../api/messages";
import { reportListing } from "../api/reports";
import { fetchMyRating, fetchSellerRatingSummary, rateListing } from "../api/ratings";
import { ListingsMap } from "../components/map/ListingsMap";
import { PhotoCarousel } from "../components/PhotoCarousel";
import { BackButton } from "../components/BackButton";
import { StarRating } from "../components/StarRating";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { openTelegramLink, shareListing, showAlert } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

const STATUS_INFO: Record<ListingStatus, { labelKey: TranslationKey; icon: LucideIcon; className: string }> = {
  PENDING: { labelKey: "status.pending", icon: Clock, className: "text-amber-500" },
  ACTIVE: { labelKey: "status.active", icon: CheckCircle2, className: "text-emerald-500" },
  PAUSED: { labelKey: "status.paused", icon: PauseCircle, className: "text-hint" },
  SOLD: { labelKey: "status.sold", icon: Tag, className: "text-link" },
  REJECTED: { labelKey: "status.rejected", icon: XCircle, className: "text-destructive" },
};

export function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  useBackButton("/");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showAdvertiseSuggestion, setShowAdvertiseSuggestion] = useState(
    Boolean((location.state as { justCreated?: boolean } | null)?.justCreated),
  );

  const formatPrice = (price: number | null, isNegotiable: boolean): string => {
    if (isNegotiable || price == null) return t("negotiable");
    return `${price.toLocaleString("uz-UZ")} ${t("som")}`;
  };

  const [messageText, setMessageText] = useState("");
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [ratingComment, setRatingComment] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [boostDuration, setBoostDuration] = useState<BoostDuration>("DAYS_7");
  const [boostStatus, setBoostStatus] = useState<string | null>(null);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => fetchListing(listingId!),
    enabled: Boolean(listingId),
  });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const { data: favoriteStatus } = useQuery({
    queryKey: ["favorite-status", listingId],
    queryFn: () => fetchFavoriteStatus(listingId!),
    enabled: Boolean(listingId),
  });
  const { data: blockStatus } = useQuery({
    queryKey: ["block-status", listing?.seller.id],
    queryFn: () => checkBlockStatus(listing!.seller.id),
    enabled: Boolean(listing?.seller.id && me && me.id !== listing.seller.id),
  });
  const { data: ratingSummary } = useQuery({
    queryKey: ["rating-summary", listing?.seller.id],
    queryFn: () => fetchSellerRatingSummary(listing!.seller.id),
    enabled: Boolean(listing?.seller.id),
  });
  const { data: myRating } = useQuery({
    queryKey: ["my-rating", listingId],
    queryFn: () => fetchMyRating(listingId!),
    enabled: Boolean(listingId),
  });
  const { data: stats } = useQuery({
    queryKey: ["listing-stats", listingId],
    queryFn: () => fetchListingStats(listingId!),
    enabled:
      Boolean(listingId) &&
      me != null &&
      listing != null &&
      (me.id === listing.seller.id || me.isAdmin),
  });

  useEffect(() => {
    if (myRating?.comment) setRatingComment(myRating.comment);
  }, [myRating?.comment]);

  const favoriteMutation = useMutation({
    mutationFn: () =>
      favoriteStatus?.isFavorite ? removeFavorite(listingId!) : addFavorite(listingId!),
    onSuccess: (result) => {
      queryClient.setQueryData(["favorite-status", listingId], result);
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const messageMutation = useMutation({
    mutationFn: () => sendListingMessage(listingId!, messageText),
    onSuccess: (result) => {
      setMessageText("");
      setMessageStatus(result.delivered ? t("listing.messageSent") : t("listing.messageNotDelivered"));
    },
    onError: (err: Error) => setMessageStatus(err.message),
  });

  const reportMutation = useMutation({
    mutationFn: () => reportListing(listingId!, reportReason),
    onSuccess: () => {
      setReportReason("");
      setReportOpen(false);
      setReportStatus(t("listing.reportSent"));
    },
    onError: (err: Error) => setReportStatus(err.message),
  });

  const ratingMutation = useMutation({
    mutationFn: (stars: number) => rateListing(listingId!, stars, ratingComment || undefined),
    onSuccess: (result) => {
      queryClient.setQueryData(["my-rating", listingId], result);
      void queryClient.invalidateQueries({ queryKey: ["rating-summary", listing?.seller.id] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: "ACTIVE" | "PAUSED" | "SOLD") => updateListingStatus(listingId!, status),
    onSuccess: (updated) => queryClient.setQueryData(["listing", listingId], updated),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteListing(listingId!),
    onSuccess: () => navigate("/my-listings", { replace: true }),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveListing(listingId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listing", listingId] }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectListing(listingId!, rejectReason.trim() || undefined),
    onSuccess: () => {
      setRejectOpen(false);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
    },
  });

  const grantBoostMutation = useMutation({
    mutationFn: () => grantBoost(listingId!, boostDuration),
    onSuccess: () => {
      setBoostStatus(t("admin.boostGranted"));
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
    },
  });

  const bumpMutation = useMutation({
    mutationFn: () => bumpListing(listingId!),
    onSuccess: (updated) => {
      queryClient.setQueryData(["listing", listingId], updated);
      showAlert(t("listing.bumped"));
    },
  });

  const blockMutation = useMutation({
    mutationFn: () =>
      blockStatus?.isBlocked ? unblockUser(listing!.seller.id) : blockUser(listing!.seller.id),
    onSuccess: (result) => queryClient.setQueryData(["block-status", listing?.seller.id], result),
  });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (error || !listing) return <div className="p-4 text-center text-destructive">{t("listing.notFound")}</div>;

  const isBoosted = Boolean(listing.boostedUntil && new Date(listing.boostedUntil) > new Date());
  const isOwner = Boolean(me && me.id === listing.seller.id);
  const isAdminViewing = Boolean(me?.isAdmin && !isOwner);
  const isAdminModeration = Boolean(isAdminViewing && listing.status === "PENDING");
  const { labelKey: statusLabelKey, icon: StatusIcon, className: statusClassName } = STATUS_INFO[listing.status];

  const handleContact = (type: ContactEventType) => {
    void logContactEvent(listing.id, type);
  };

  return (
    <div className="page">
      <div className="relative -mx-4 -mt-4">
        <PhotoCarousel photos={listing.photos} />

        <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
          <BackButton fallbackTo="/" className="bg-surface/90 shadow-float backdrop-blur" />
          {isBoosted && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-float">
              <Rocket className="h-3.5 w-3.5" />
              {t("listing.top")}
            </span>
          )}
        </div>
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => shareListing(listing.title, listing.id)}
            aria-label={t("listing.share")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 shadow-float backdrop-blur"
          >
            <Share2 className="h-5 w-5 text-hint" />
          </button>
          <button
            onClick={() => favoriteMutation.mutate()}
            aria-label={t("listing.addToFavorites")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 shadow-float backdrop-blur"
          >
            <Heart
              className={`h-5 w-5 ${favoriteStatus?.isFavorite ? "fill-destructive text-destructive" : "text-hint"}`}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold leading-snug text-ink">{listing.title}</h1>
          {listing.condition && (
            <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-[11px] font-semibold text-hint">
              {listing.condition === "NEW" ? t("create.conditionNew") : t("create.conditionUsed")}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-brand">
            {formatPrice(listing.price, listing.isNegotiable)}
          </span>
          <span className="flex items-center gap-1 text-xs text-hint">
            <Eye className="h-3.5 w-3.5" />
            {listing.viewsCount.toLocaleString("uz-UZ")} {t("listing.views")}
          </span>
        </div>
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{listing.description}</p>

      {listing.addressText && (
        <div className="flex items-center gap-1.5 text-sm text-hint">
          <MapPin className="h-4 w-4 shrink-0" />
          {listing.addressText}
        </div>
      )}

      {listing.lat != null && listing.lng != null && (
        <ListingsMap listings={[listing]} heightClassName="h-36" zoom={15} interactive={false} />
      )}

      {showAdvertiseSuggestion && isOwner && (
        <div className="card flex flex-col gap-3 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-amber-600">
              <Megaphone className="h-4 w-4" />
              {t("advertise.suggestTitle")}
            </span>
            <button
              onClick={() => setShowAdvertiseSuggestion(false)}
              aria-label={t("cancel")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-secondary"
            >
              <X className="h-3.5 w-3.5 text-hint" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs text-ink">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {t("advertise.suggestFeature1")}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {t("advertise.suggestFeature2")}
            </span>
          </div>
          <Link
            to={`/listings/${listing.id}/advertise`}
            onClick={() => setShowAdvertiseSuggestion(false)}
            className="btn-primary"
          >
            <Megaphone className="h-4 w-4" />
            {t("advertise.button")}
          </Link>
        </div>
      )}

      {isAdminModeration && (
        <div className="card flex flex-col gap-3">
          <span className="text-sm font-semibold text-ink">{t("listing.moderationTitle")}</span>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
              <User className="h-4 w-4 text-hint" />
            </div>
            <span className="text-sm text-ink">
              {listing.seller.username ? `@${listing.seller.username}` : listing.seller.firstName}
            </span>
          </div>
          {rejectOpen ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("admin.rejectReasonPlaceholder")}
                className="input min-h-16"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setRejectOpen(false);
                    setRejectReason("");
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-hint transition active:scale-[0.98]"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive py-2.5 text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  {t("admin.confirmReject")}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-500 transition active:scale-[0.98] disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {t("admin.approve")}
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition active:scale-[0.98]"
              >
                <X className="h-3.5 w-3.5" />
                {t("admin.reject")}
              </button>
            </div>
          )}
        </div>
      )}

      {(isOwner || isAdminViewing) && (
        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">{t("listing.manageTitle")}</span>
            <span className={`flex items-center gap-1 text-xs font-medium ${statusClassName}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {t(statusLabelKey)}
            </span>
          </div>

          {isAdminViewing && (
            <div className="flex items-center gap-2 rounded-xl bg-surface-secondary px-3 py-2 text-xs text-hint">
              <User className="h-3.5 w-3.5 shrink-0" />
              {t("admin.listingOwner")}:{" "}
              <span className="font-medium text-ink">
                {listing.seller.username ? `@${listing.seller.username}` : listing.seller.firstName}
              </span>
            </div>
          )}

          {listing.status === "REJECTED" && listing.rejectionReason && (
            <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
              <span className="font-semibold">{t("listing.rejectionReasonLabel")}: </span>
              {listing.rejectionReason}
            </div>
          )}

          {isOwner && listing.status === "ACTIVE" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => bumpMutation.mutate()}
                disabled={bumpMutation.isPending}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-brand/10 py-2.5 text-xs font-semibold text-brand transition active:scale-[0.98] disabled:opacity-50"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {t("listing.bump")}
              </button>
              <Link
                to={`/listings/${listing.id}/advertise`}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-500 transition active:scale-[0.98]"
              >
                <Megaphone className="h-3.5 w-3.5" />
                {t("advertise.button")}
              </Link>
            </div>
          )}
          {bumpMutation.isError && (
            <span className="text-xs text-destructive">{bumpMutation.error.message}</span>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/listings/${listing.id}/edit`}
              state={{ listing }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-brand/10 py-2.5 text-xs font-semibold text-brand transition active:scale-[0.98]"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("myListings.edit")}
            </Link>
            {listing.status !== "REJECTED" && listing.status !== "PENDING" && (
              <>
                {listing.status !== "ACTIVE" && (
                  <button
                    onClick={() => statusMutation.mutate("ACTIVE")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-500 transition active:scale-[0.98]"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    {t("myListings.activate")}
                  </button>
                )}
                {listing.status === "ACTIVE" && (
                  <button
                    onClick={() => statusMutation.mutate("PAUSED")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-hint transition active:scale-[0.98]"
                  >
                    <PauseCircle className="h-3.5 w-3.5" />
                    {t("myListings.pause")}
                  </button>
                )}
                {listing.status !== "SOLD" && (
                  <button
                    onClick={() => statusMutation.mutate("SOLD")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-hint transition active:scale-[0.98]"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {t("myListings.markSold")}
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => deleteMutation.mutate()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition active:scale-[0.98]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("delete")}
            </button>
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-2 border-t border-divider pt-3">
              <div className="flex flex-col items-center gap-0.5">
                <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                  <Eye className="h-3.5 w-3.5 text-hint" />
                  {stats.viewsCount}
                </span>
                <span className="text-[10px] text-hint">{t("listing.statViews")}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                  <MessageCircle className="h-3.5 w-3.5 text-hint" />
                  {stats.telegramClicks}
                </span>
                <span className="text-[10px] text-hint">{t("listing.statTelegram")}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                  <Phone className="h-3.5 w-3.5 text-hint" />
                  {stats.phoneClicks}
                </span>
                <span className="text-[10px] text-hint">{t("listing.statPhone")}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                  <Heart className="h-3.5 w-3.5 text-hint" />
                  {stats.favoritesCount}
                </span>
                <span className="text-[10px] text-hint">{t("listing.statFavorites")}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                  <Send className="h-3.5 w-3.5 text-hint" />
                  {stats.messagesCount}
                </span>
                <span className="text-[10px] text-hint">{t("listing.statMessages")}</span>
              </div>
            </div>
          )}

          {isAdminViewing && (
            <div className="flex flex-col gap-2 border-t border-divider pt-3">
              <span className="section-title">{t("admin.grantBoostTitle")}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(["DAYS_3", "DAYS_7", "DAYS_30"] as BoostDuration[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setBoostDuration(d)}
                    className={`rounded-lg py-2 text-xs font-semibold transition active:scale-[0.98] ${
                      boostDuration === d ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
                    }`}
                  >
                    {t(`admin.boost.${d}` as TranslationKey)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => grantBoostMutation.mutate()}
                disabled={grantBoostMutation.isPending}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-600 transition active:scale-[0.98] disabled:opacity-50"
              >
                <Rocket className="h-3.5 w-3.5" />
                {t("admin.grantBoost")}
              </button>
              {boostStatus && <span className="text-center text-xs text-hint">{boostStatus}</span>}
            </div>
          )}
        </div>
      )}

      {!isOwner && (
        <>
          <div className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
                <User className="h-4 w-4 text-hint" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-ink">
                  {listing.seller.username ? `@${listing.seller.username}` : listing.seller.firstName}
                </span>
                {ratingSummary && ratingSummary.count > 0 ? (
                  <div className="flex items-center gap-1">
                    <StarRating value={ratingSummary.avg ?? 0} size={14} />
                    <span className="text-xs text-hint">({ratingSummary.count})</span>
                  </div>
                ) : (
                  <span className="text-xs text-hint">{t("listing.notRatedYet")}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => setReportOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-hint active:bg-surface-secondary"
              >
                <Flag className="h-3.5 w-3.5" />
                {t("listing.report")}
              </button>
              <button
                onClick={() => blockMutation.mutate()}
                disabled={blockMutation.isPending}
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs active:bg-surface-secondary disabled:opacity-50 ${blockStatus?.isBlocked ? "text-destructive" : "text-hint"}`}
              >
                <Ban className="h-3.5 w-3.5" />
                {blockStatus?.isBlocked ? t("listing.unblockUser") : t("listing.blockUser")}
              </button>
            </div>
          </div>

          {reportOpen && (
            <div className="card flex flex-col gap-2">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={t("listing.reportPlaceholder")}
                className="input min-h-16"
              />
              <button
                onClick={() => reportMutation.mutate()}
                disabled={reportReason.length < 3 || reportMutation.isPending}
                className="rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                {t("listing.reportSubmit")}
              </button>
            </div>
          )}
          {reportStatus && <div className="text-xs text-hint">{reportStatus}</div>}

          <div className="flex flex-col gap-2">
            {listing.seller.username && (
              <button
                type="button"
                onClick={() => {
                  handleContact(ContactEventType.TELEGRAM_CLICK);
                  openTelegramLink(`https://t.me/${listing.seller.username}`);
                }}
                className="btn-primary"
              >
                <MessageCircle className="h-4 w-4" />
                {t("listing.contactTelegram")}
              </button>
            )}
            <a
              href={`tel:${listing.phone}`}
              onClick={() => {
                handleContact(ContactEventType.PHONE_CLICK);
                void navigator.clipboard?.writeText(listing.phone);
              }}
              className="btn-secondary"
            >
              <Phone className="h-4 w-4" />
              {t("listing.contactPhone")}: {listing.phone}
            </a>
          </div>

          <div className="card flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink">{t("listing.messageSellerTitle")}</span>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={t("listing.messagePlaceholder")}
              className="input min-h-16"
            />
            <button
              onClick={() => messageMutation.mutate()}
              disabled={messageText.trim().length === 0 || messageMutation.isPending}
              className="btn-primary"
            >
              <Send className="h-4 w-4" />
              {t("send")}
            </button>
            {messageStatus && <span className="text-xs text-hint">{messageStatus}</span>}
          </div>

          <div className="card flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink">
              {myRating ? t("listing.updateRating") : t("listing.rateSeller")}
            </span>
            <StarRating
              value={myRating?.stars ?? 0}
              onChange={(stars) => ratingMutation.mutate(stars)}
              size={26}
            />
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder={t("listing.commentPlaceholder")}
              className="input min-h-12"
            />
          </div>
        </>
      )}
    </div>
  );
}
