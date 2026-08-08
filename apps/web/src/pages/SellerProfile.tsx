import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, PackageSearch, Star, User } from "lucide-react";
import { fetchSellerListings, fetchSellerProfile } from "../api/sellers";
import { ListingCard } from "../components/ListingCard";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { StarRating } from "../components/StarRating";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";
import { formatRelativeDate } from "../utils/formatRelativeDate";

export function SellerProfile() {
  const { sellerId } = useParams<{ sellerId: string }>();
  useBackButton("/");
  const { t, lang } = useTranslation();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["seller-profile", sellerId],
    queryFn: () => fetchSellerProfile(sellerId!),
    enabled: Boolean(sellerId),
  });
  const { data: listings } = useQuery({
    queryKey: ["seller-listings", sellerId],
    queryFn: () => fetchSellerListings(sellerId!),
    enabled: Boolean(sellerId),
  });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (error || !profile) return <div className="p-4 text-center text-destructive">{t("listing.notFound")}</div>;

  return (
    <div className="page">
      <PageHeader title={t("seller.title")} backTo="/" />

      <div className="card flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
          <User className="h-6 w-6 text-hint" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-base font-bold text-ink">
            {profile.username ? `@${profile.username}` : profile.firstName}
            {profile.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
          </span>
          {profile.ratingCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <StarRating value={profile.ratingAvg ?? 0} size={14} />
              <span className="text-xs text-hint">({profile.ratingCount})</span>
            </div>
          ) : (
            <span className="text-xs text-hint">{t("listing.notRatedYet")}</span>
          )}
          <span className="flex items-center gap-1 text-xs text-hint">
            <Star className="h-3 w-3" />
            {t("seller.memberSince")} {formatRelativeDate(profile.createdAt, t, lang)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="section-title">
          {t("seller.activeListings")} ({profile.activeListingsCount})
        </span>
        {listings?.length === 0 && <EmptyState icon={PackageSearch} title={t("seller.noListings")} />}
        <div className="grid grid-cols-2 gap-3">
          {listings?.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
}
