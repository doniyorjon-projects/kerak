import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Eye, Heart, ImageOff, MapPin, Rocket } from "lucide-react";
import type { ListingDto } from "@kerak/shared";
import { addFavorite, removeFavorite } from "../api/favorites";
import { fetchPublicSettings } from "../api/settings";
import { REGIONS } from "../data/uzbekistanRegions";
import { useFavoriteIds } from "../hooks/useFavoriteIds";
import { useDisplayCurrency } from "../contexts/DisplayCurrencyContext";
import { useTranslation } from "../i18n/LanguageContext";
import { formatRelativeDate } from "../utils/formatRelativeDate";
import { formatListingPrice } from "../utils/formatListingPrice";

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toLocaleString("uz-UZ", { maximumFractionDigits: 1 })} km`;
}

function getDistrictName(regionId: number | null, districtId: number | null): string | null {
  if (regionId == null || districtId == null) return null;
  const region = REGIONS.find((r) => r.id === regionId);
  return region?.districts.find((d) => d.id === districtId)?.nameUz ?? null;
}

export function ListingCard({ listing }: { listing: ListingDto }) {
  const { t, lang } = useTranslation();
  const queryClient = useQueryClient();
  const { data: favoriteIds } = useFavoriteIds();
  const { displayCurrency } = useDisplayCurrency();
  const { data: publicSettings } = useQuery({ queryKey: ["public-settings"], queryFn: fetchPublicSettings });
  const isFavorite = favoriteIds?.has(listing.id) ?? false;
  const isBoosted = Boolean(listing.boostedUntil && new Date(listing.boostedUntil) > new Date());
  const districtName = getDistrictName(listing.regionId, listing.districtId);

  const favoriteMutation = useMutation({
    mutationFn: () => (isFavorite ? removeFavorite(listing.id) : addFavorite(listing.id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    favoriteMutation.mutate();
  };

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-divider bg-surface shadow-soft transition active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface-secondary">
        {isBoosted && (
          <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-promo px-2 py-0.5 text-[10px] font-semibold text-white shadow-soft">
            <Rocket className="h-3 w-3" />
            TOP
          </span>
        )}
        <button
          onClick={handleFavoriteClick}
          aria-label={t("listing.addToFavorites")}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 shadow-soft backdrop-blur"
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-destructive text-destructive" : "text-hint"}`} />
        </button>
        {listing.photos[0] ? (
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-300 group-active:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-hint" strokeWidth={1.5} />
          </div>
        )}
        {listing.condition && (
          <span className="absolute bottom-2 left-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            {listing.condition === "NEW" ? t("create.conditionNew") : t("create.conditionUsed")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="line-clamp-2 min-h-[2.4rem] text-sm font-medium leading-snug text-ink">
          {listing.title}
        </span>
        <span className="text-sm font-semibold text-brand">
          {formatListingPrice(listing, publicSettings?.usdRate ?? 12700, displayCurrency, t("negotiable"), t("som"))}
        </span>
        <div className="flex items-center justify-between gap-2 text-xs text-hint">
          {districtName ? (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{districtName}</span>
            </span>
          ) : (
            <span />
          )}
          <span className="flex shrink-0 items-center gap-1">
            <Eye className="h-3 w-3" />
            {listing.viewsCount}
          </span>
        </div>
        {listing.distanceKm != null && (
          <span className="flex items-center gap-1 text-xs text-hint">
            <MapPin className="h-3 w-3" />
            {formatDistance(listing.distanceKm)}
          </span>
        )}
        <span className="mt-auto flex items-center gap-1 pt-1 text-[11px] text-hint">
          <Clock className="h-3 w-3" />
          {formatRelativeDate(listing.createdAt, t, lang)}
        </span>
      </div>
    </Link>
  );
}
