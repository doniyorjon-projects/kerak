import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Heart, ImageOff, MapPin, Rocket } from "lucide-react";
import type { ListingDto } from "@kerak/shared";
import { addFavorite, removeFavorite } from "../api/favorites";
import { useFavoriteIds } from "../hooks/useFavoriteIds";
import { useTranslation } from "../i18n/LanguageContext";

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toLocaleString("uz-UZ", { maximumFractionDigits: 1 })} km`;
}

export function ListingCard({ listing }: { listing: ListingDto }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: favoriteIds } = useFavoriteIds();
  const isFavorite = favoriteIds?.has(listing.id) ?? false;
  const isBoosted = Boolean(listing.boostedUntil && new Date(listing.boostedUntil) > new Date());

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
      className="group flex flex-col overflow-hidden rounded-2xl border border-divider bg-surface shadow-soft transition active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface-secondary">
        {isBoosted && (
          <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-soft">
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
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="line-clamp-2 text-sm font-medium leading-snug text-ink">{listing.title}</span>
        <span className="text-sm font-semibold text-brand">
          {listing.isNegotiable || listing.price == null
            ? t("negotiable")
            : `${listing.price.toLocaleString("uz-UZ")} ${t("som")}`}
        </span>
        <div className="flex items-center justify-between text-xs text-hint">
          {listing.distanceKm != null ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {formatDistance(listing.distanceKm)}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {listing.viewsCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
