import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  BadgeCheck,
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
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORY_ATTRIBUTES, ContactEventType } from "@kerak/shared";
import type { BoostDuration, ListingStatus } from "@kerak/shared";
import {
  bumpListing,
  deleteListing,
  fetchListing,
  fetchListingStats,
  fetchPriceHistory,
  fetchSimilarListings,
  logContactEvent,
  updateListingStatus,
} from "../api/listings";
import { fetchCategories } from "../api/categories";
import { fetchPricing } from "../api/pricing";
import { fetchPublicSettings } from "../api/settings";
import { useDisplayCurrency } from "../contexts/DisplayCurrencyContext";
import { formatListingPrice } from "../utils/formatListingPrice";
import { approveListing, grantBoost, rejectListing } from "../api/admin";
import { fetchMe } from "../api/users";
import { blockUser, checkBlockStatus, unblockUser } from "../api/blocks";
import { addFavorite, fetchFavoriteStatus, removeFavorite } from "../api/favorites";
import { fetchListingMessages, sendListingMessage } from "../api/messages";
import { reportListing } from "../api/reports";
import { fetchListingRatings, fetchMyRating, fetchSellerRatingSummary, rateListing, replyToRating } from "../api/ratings";
import { ListingsMap } from "../components/map/ListingsMap";
import { ListingCard } from "../components/ListingCard";
import { PhotoCarousel } from "../components/PhotoCarousel";
import { BackButton } from "../components/BackButton";
import { StarRating } from "../components/StarRating";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { callPhone, openTelegramLink, shareListing, showAlert } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";
import { formatRelativeDate } from "../utils/formatRelativeDate";
import { addRecentlyViewed } from "../utils/recentlyViewed";

const STATUS_INFO: Record<ListingStatus, { labelKey: TranslationKey; icon: LucideIcon; className: string }> = {
  PENDING: { labelKey: "status.pending", icon: Clock, className: "text-promo" },
  ACTIVE: { labelKey: "status.active", icon: CheckCircle2, className: "text-success" },
  PAUSED: { labelKey: "status.paused", icon: PauseCircle, className: "text-hint" },
  SOLD: { labelKey: "status.sold", icon: Tag, className: "text-link" },
  REJECTED: { labelKey: "status.rejected", icon: XCircle, className: "text-destructive" },
};

export function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  useBackButton("/");
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showAdvertiseSuggestion, setShowAdvertiseSuggestion] = useState(
    Boolean((location.state as { justCreated?: boolean } | null)?.justCreated),
  );


  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [ratingComment, setRatingComment] = useState("");
  const [pendingStars, setPendingStars] = useState(0);
  const [ratingIsAnonymous, setRatingIsAnonymous] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
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
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const listingCategory = categories?.find((c) => c.id === listing?.categoryId);
  const attributeFields = listingCategory ? (CATEGORY_ATTRIBUTES[listingCategory.nameUz] ?? []) : [];
  const { data: pricing } = useQuery({ queryKey: ["pricing"], queryFn: fetchPricing });
  const cheapestBoostPrice = pricing?.boostDays3 ?? 0;
  const { data: publicSettings } = useQuery({ queryKey: ["public-settings"], queryFn: fetchPublicSettings });
  const { displayCurrency } = useDisplayCurrency();
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
  const { data: listingRatings } = useQuery({
    queryKey: ["listing-ratings", listingId],
    queryFn: () => fetchListingRatings(listingId!),
    enabled: Boolean(listingId),
  });
  const { data: priceHistory } = useQuery({
    queryKey: ["price-history", listingId],
    queryFn: () => fetchPriceHistory(listingId!),
    enabled: Boolean(listingId),
  });
  const { data: similarListings } = useQuery({
    queryKey: ["similar-listings", listingId],
    queryFn: () => fetchSimilarListings(listingId!),
    enabled: Boolean(listingId),
  });
  const { data: messages } = useQuery({
    queryKey: ["listing-messages", listingId],
    queryFn: () => fetchListingMessages(listingId!),
    enabled: Boolean(listingId && me && listing && me.id !== listing.seller.id),
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
    if (myRating?.stars) setPendingStars(myRating.stars);
  }, [myRating?.comment, myRating?.stars]);

  useEffect(() => {
    if (listing?.id) addRecentlyViewed(listing.id);
  }, [listing?.id]);

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
      void queryClient.invalidateQueries({ queryKey: ["listing-messages", listingId] });
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
    mutationFn: () => rateListing(listingId!, pendingStars, ratingComment || undefined, ratingIsAnonymous),
    onSuccess: (result) => {
      queryClient.setQueryData(["my-rating", listingId], result);
      void queryClient.invalidateQueries({ queryKey: ["rating-summary", listing?.seller.id] });
      void queryClient.invalidateQueries({ queryKey: ["listing-ratings", listingId] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (ratingId: string) => replyToRating(ratingId, replyDrafts[ratingId] ?? ""),
    onSuccess: () => {
      setOpenReplyId(null);
      void queryClient.invalidateQueries({ queryKey: ["listing-ratings", listingId] });
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
  const lastOldPrice = priceHistory && priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].price : null;
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
            <span className="flex items-center gap-1 rounded-full bg-promo px-2.5 py-1 text-[11px] font-semibold text-white shadow-float">
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
        {listing.brand && (
          <span className="w-fit rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
            {listing.brand}
          </span>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-brand">
              {formatListingPrice(
                listing,
                publicSettings?.usdRate ?? 12700,
                displayCurrency,
                t("negotiable"),
                t("som"),
              )}
            </span>
            {lastOldPrice != null && listing.price != null && lastOldPrice > listing.price && (
              <span className="flex items-center gap-1 text-xs text-hint line-through">
                {lastOldPrice.toLocaleString("uz-UZ")} {t("som")}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-hint">
            <Eye className="h-3.5 w-3.5" />
            {listing.viewsCount.toLocaleString("uz-UZ")} {t("listing.views")}
          </span>
        </div>
        {lastOldPrice != null && listing.price != null && lastOldPrice > listing.price && (
          <span className="flex w-fit items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success-dark">
            <TrendingDown className="h-3 w-3" />
            {t("listing.priceDropped")}
          </span>
        )}
      </div>

      {listing.attributes && attributeFields.length > 0 && (
        <div className="card grid grid-cols-2 gap-x-3 gap-y-2.5">
          {attributeFields.map((field) => {
            const value = listing.attributes?.[field.key];
            if (!value) return null;
            return (
              <div key={field.key} className="flex flex-col gap-0.5">
                <span className="text-xs text-hint">{field.label}</span>
                <span className="text-sm font-medium text-ink">
                  {value}
                  {field.unit ? ` ${field.unit}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{listing.description}</p>

      {listing.addressText && (
        <div className="flex items-center gap-1.5 text-sm text-hint">
          <MapPin className="h-4 w-4 shrink-0" />
          {listing.addressText}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-hint">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        {formatRelativeDate(listing.createdAt, t, lang)}
      </div>

      {listing.lat != null && listing.lng != null && (
        <ListingsMap listings={[listing]} heightClassName="h-36" zoom={15} />
      )}

      {showAdvertiseSuggestion &&
        isOwner &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div
              className="absolute inset-0 bg-black/50 motion-safe:animate-[backdrop-fade-in_0.2s_ease-out]"
              onClick={() => setShowAdvertiseSuggestion(false)}
            />
            <div className="relative z-10 flex w-full max-w-md flex-col gap-4 rounded-t-2xl bg-app p-4 pb-6 motion-safe:animate-[sheet-slide-up_0.28s_cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex flex-col items-center gap-2 pt-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <span className="text-base font-bold text-ink">{t("create.successMessage")}</span>
              </div>

              <div className="card flex flex-col gap-3 border-promo/30 bg-promo/5">
                <span className="flex items-center gap-2 text-sm font-semibold text-promo-dark">
                  <Megaphone className="h-4 w-4" />
                  {t("advertise.suggestTitle")}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-ink">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                    {t("advertise.suggestFeature1")}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-ink">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                    {t("advertise.suggestFeature2")}
                  </span>
                </div>

                {me && (
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-xs text-hint">
                      <Wallet className="h-3.5 w-3.5 shrink-0" />
                      {t("wallet.balanceLabel")}
                    </span>
                    <span
                      className={`text-sm font-bold ${me.balance >= cheapestBoostPrice ? "text-success-dark" : "text-ink"}`}
                    >
                      {me.balance.toLocaleString("uz-UZ")} {t("som")}
                    </span>
                  </div>
                )}
                {me && me.balance >= cheapestBoostPrice && (
                  <span className="flex items-center gap-1.5 text-[11px] text-success-dark">
                    <Check className="h-3 w-3 shrink-0" />
                    {t("advertise.walletReadyHint")}
                  </span>
                )}

                <Link
                  to={`/listings/${listing.id}/advertise`}
                  onClick={() => setShowAdvertiseSuggestion(false)}
                  className="btn-primary"
                >
                  <Megaphone className="h-4 w-4" />
                  {t("advertise.button")}
                </Link>
              </div>

              <button onClick={() => setShowAdvertiseSuggestion(false)} className="btn-secondary">
                {t("create.skipAdvertise")}
              </button>
            </div>
          </div>,
          document.body,
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
                className="flex items-center justify-center gap-1.5 rounded-xl bg-success/10 py-2.5 text-xs font-semibold text-success transition active:scale-[0.98] disabled:opacity-50"
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
                className="flex items-center justify-center gap-1.5 rounded-xl bg-promo/10 py-2.5 text-xs font-semibold text-promo transition active:scale-[0.98]"
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
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-success/10 py-2.5 text-xs font-semibold text-success transition active:scale-[0.98]"
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
                className="flex items-center justify-center gap-1.5 rounded-xl bg-promo/10 py-2.5 text-xs font-semibold text-promo-dark transition active:scale-[0.98] disabled:opacity-50"
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
            <Link to={`/sellers/${listing.seller.id}`} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
                <User className="h-4 w-4 text-hint" />
              </div>
              <div className="flex flex-col">
                <span className="flex items-center gap-1 text-sm font-medium text-ink">
                  {listing.seller.username ? `@${listing.seller.username}` : listing.seller.firstName}
                  {ratingSummary?.isVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />}
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
            </Link>
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
            {phoneRevealed ? (
              <a
                href={`tel:${listing.phone}`}
                onClick={() => callPhone(listing.phone)}
                className="btn-secondary"
              >
                <Phone className="h-4 w-4" />
                {listing.phone}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleContact(ContactEventType.PHONE_CLICK);
                  void navigator.clipboard?.writeText(listing.phone);
                  setPhoneRevealed(true);
                }}
                className="btn-secondary"
              >
                <Phone className="h-4 w-4" />
                {t("listing.showPhone")}
              </button>
            )}
          </div>

          <div className="card flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink">{t("listing.messageSellerTitle")}</span>
            {messages && messages.length > 0 && (
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-xl bg-surface-secondary p-2.5">
                {messages.map((m) => {
                  const isMine = m.fromUserId === me?.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-1.5 text-sm ${
                          isMine ? "bg-brand text-brand-contrast" : "bg-surface text-ink"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="mt-0.5 text-[10px] text-hint">{formatRelativeDate(m.createdAt, t, lang)}</span>
                    </div>
                  );
                })}
              </div>
            )}
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
            <StarRating value={pendingStars} onChange={setPendingStars} size={26} />
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder={t("listing.commentPlaceholder")}
              className="input min-h-12"
            />
            <label className="flex items-center gap-2 text-xs text-hint">
              <input
                type="checkbox"
                checked={ratingIsAnonymous}
                onChange={(e) => setRatingIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded accent-brand"
              />
              {t("listing.rateAnonymously")}
            </label>
            {pendingStars > 0 && (
              <button
                onClick={() => ratingMutation.mutate()}
                disabled={ratingMutation.isPending}
                className="btn-primary disabled:opacity-50"
              >
                {ratingMutation.isPending ? t("saving") : t("listing.saveRating")}
              </button>
            )}
            {ratingMutation.isSuccess && (
              <span className="text-xs text-success">{t("listing.ratingSaved")}</span>
            )}
          </div>
        </>
      )}

      {listingRatings && listingRatings.length > 0 && (
        <div className="card flex flex-col gap-3">
          <span className="text-sm font-semibold text-ink">{t("listing.reviewsTitle")}</span>
          <div className="flex flex-col gap-3">
            {listingRatings.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-1.5 border-t border-divider pt-3 first:border-0 first:pt-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StarRating value={r.stars} size={14} />
                    <span className="text-xs font-medium text-ink">
                      {r.raterName ?? t("listing.anonymousReviewer")}
                    </span>
                  </div>
                  <span className="text-[11px] text-hint">{formatRelativeDate(r.createdAt, t, lang)}</span>
                </div>
                {r.comment && <p className="text-sm text-ink">{r.comment}</p>}

                {r.sellerReply ? (
                  <div className="ml-3 flex flex-col gap-0.5 rounded-xl bg-surface-secondary p-2.5">
                    <span className="text-xs font-semibold text-brand">{t("listing.sellerReplyLabel")}</span>
                    <span className="text-xs text-ink">{r.sellerReply}</span>
                  </div>
                ) : (
                  isOwner && (
                    <div className="ml-3 flex flex-col gap-1.5">
                      {openReplyId === r.id ? (
                        <>
                          <textarea
                            value={replyDrafts[r.id] ?? ""}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))
                            }
                            placeholder={t("listing.replyPlaceholder")}
                            className="input min-h-10 text-xs"
                          />
                          <button
                            onClick={() => replyMutation.mutate(r.id)}
                            disabled={
                              !replyDrafts[r.id]?.trim() ||
                              (replyMutation.isPending && replyMutation.variables === r.id)
                            }
                            className="btn-secondary text-xs disabled:opacity-50"
                          >
                            {t("listing.sendReply")}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setOpenReplyId(r.id)}
                          className="w-fit text-xs text-brand active:underline"
                        >
                          {t("listing.replyToReview")}
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {similarListings && similarListings.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="section-title">{t("listing.similarTitle")}</span>
          <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
            <div className="flex gap-3">
              {similarListings.map((l) => (
                <div key={l.id} className="w-40 shrink-0">
                  <ListingCard listing={l} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
