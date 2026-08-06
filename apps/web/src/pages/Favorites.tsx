import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { fetchFavorites } from "../api/favorites";
import { ListingCard } from "../components/ListingCard";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useTranslation } from "../i18n/LanguageContext";

export function Favorites() {
  const { t } = useTranslation();
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
  });

  return (
    <div className="page">
      <PageHeader title={t("favorites.title")} />

      {isLoading && <Spinner label={t("loading")} />}
      {error && <div className="text-center text-destructive">{t("favorites.loadError")}</div>}
      {listings?.length === 0 && (
        <EmptyState icon={Heart} title={t("favorites.empty")} description={t("favorites.emptyHint")} />
      )}

      <div className="grid grid-cols-2 gap-3">
        {listings?.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
