import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PackageSearch } from "lucide-react";
import type { FeedSort } from "@kerak/shared";
import { fetchListingFeed } from "../api/listings";
import { fetchCategories, getCategoryName } from "../api/categories";
import { fetchMe } from "../api/users";
import { ListingCard } from "../components/ListingCard";
import { FeedControls } from "../components/FeedControls";
import { FeedFilters, type FeedFilterValue } from "../components/FeedFilters";
import { ListingsMap } from "../components/map/ListingsMap";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

export function CategoryFeed() {
  const { categoryId } = useParams<{ categoryId: string }>();
  useBackButton("/categories");
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const category = categories?.find((c) => c.id === categoryId);
  const hasLocation = me?.lat != null && me?.lng != null;

  const [sort, setSort] = useState<FeedSort>("newest");
  const [radiusKm, setRadiusKm] = useState(20);
  const [view, setView] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState<FeedFilterValue>({});

  const effectiveSort = sort === "distance" && !hasLocation ? "newest" : sort;

  const handleSortChange = (newSort: FeedSort) => {
    if (newSort === "distance" && !hasLocation) {
      navigate("/profile");
      return;
    }
    setSort(newSort);
  };

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ["listings", categoryId, effectiveSort, radiusKm, me?.lat, me?.lng, filters],
    queryFn: () =>
      fetchListingFeed(
        effectiveSort === "distance" && me?.lat != null && me?.lng != null
          ? { categoryId, sort: "distance", lat: me.lat, lng: me.lng, radiusKm, ...filters }
          : { categoryId, sort: "newest", ...filters },
      ),
    enabled: Boolean(categoryId),
  });

  return (
    <div className="page">
      <PageHeader
        title={category ? `${category.icon ?? ""} ${getCategoryName(category, lang)}`.trim() : t("categoryFeed.fallbackTitle")}
        backTo="/categories"
      />

      <div className="flex flex-wrap items-center gap-2">
        <FeedFilters value={filters} onChange={setFilters} />
      </div>
      <FeedControls
        sort={sort}
        onSortChange={handleSortChange}
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        view={view}
        onViewChange={setView}
        hasLocation={hasLocation}
      />

      {isLoading && <Spinner label={t("loading")} />}
      {error && (
        <EmptyState icon={PackageSearch} title={t("home.loadError")} description={t("tryAgain")} />
      )}
      {listings?.length === 0 && (
        <EmptyState icon={PackageSearch} title={t("categoryFeed.empty")} />
      )}

      {view === "map" && listings ? (
        <ListingsMap
          listings={listings}
          myLocation={hasLocation ? { lat: me!.lat!, lng: me!.lng! } : null}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {listings?.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
