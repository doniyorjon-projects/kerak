import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellPlus, ChevronRight, MessageSquareText, PackageSearch, Rocket } from "lucide-react";
import type { FeedSort } from "@kerak/shared";
import { fetchListingFeed, fetchListingsByIds } from "../api/listings";
import { fetchCategories } from "../api/categories";
import { fetchMe, updateLocation } from "../api/users";
import { createSavedSearch } from "../api/savedSearches";
import { ListingCard } from "../components/ListingCard";
import { FeedControls } from "../components/FeedControls";
import { FeedFilters, type FeedFilterValue } from "../components/FeedFilters";
import { ListingsMap } from "../components/map/ListingsMap";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { SearchBar } from "../components/SearchBar";
import { NotificationBell } from "../components/NotificationBell";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { BannerCarousel } from "../components/BannerCarousel";
import { CategoryScroller } from "../components/CategoryScroller";
import { RegionBanner, RegionBannerTrigger } from "../components/RegionBanner";
import { useTranslation } from "../i18n/LanguageContext";
import { getRecentlyViewedIds } from "../utils/recentlyViewed";

export function Home() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const hasLocation = me?.lat != null && me?.lng != null;
  const rootCategories = (categories ?? []).filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  const [sort, setSort] = useState<FeedSort>("newest");
  const [radiusKm, setRadiusKm] = useState(20);
  const [view, setView] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState<FeedFilterValue>({});
  const [saveSearchOpen, setSaveSearchOpen] = useState(false);
  const [searchLabel, setSearchLabel] = useState("");

  // FeedFilters'dan aniq tanlangan hudud ustunroq, aks holda Asosiydagi
  // hudud banneri orqali tanlangan hudud qo'llaniladi.
  const effectiveRegionId = filters.regionId ?? me?.regionId ?? undefined;
  const effectiveDistrictId = filters.districtId ?? me?.districtId ?? undefined;

  const clearRegionMutation = useMutation({
    mutationFn: () => updateLocation(null, null, null, null),
    onSuccess: (updated) => queryClient.setQueryData(["me"], updated),
  });

  const hasActiveSearch = Boolean(
    search ||
      filters.categoryId ||
      filters.regionId ||
      filters.districtId ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.condition ||
      filters.isFree ||
      filters.isUrgent ||
      filters.hasDelivery ||
      (filters.attributes && Object.keys(filters.attributes).length > 0),
  );

  const saveSearchMutation = useMutation({
    mutationFn: () => createSavedSearch({ label: searchLabel.trim() || search || t("savedSearch.defaultLabel"), q: search || undefined, ...filters }),
    onSuccess: () => {
      setSaveSearchOpen(false);
      setSearchLabel("");
      queryClient.invalidateQueries({ queryKey: ["saved-searches"] });
    },
  });

  const effectiveSort = sort === "distance" && !hasLocation ? "newest" : sort;
  const isSearching = search.trim().length > 0;

  const handleSortChange = (newSort: FeedSort) => {
    if (newSort === "distance" && !hasLocation) {
      setRegionPickerOpen(true);
      return;
    }
    setSort(newSort);
  };

  const PAGE_SIZE = 20;

  const {
    data: listingsPages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "listings",
      "all",
      effectiveSort,
      radiusKm,
      me?.lat,
      me?.lng,
      effectiveRegionId,
      effectiveDistrictId,
      search,
      filters,
    ],
    queryFn: ({ pageParam }) =>
      fetchListingFeed(
        effectiveSort === "distance" && me?.lat != null && me?.lng != null
          ? {
              sort: "distance",
              lat: me.lat,
              lng: me.lng,
              radiusKm,
              q: search || undefined,
              ...filters,
              regionId: effectiveRegionId,
              districtId: effectiveDistrictId,
              limit: PAGE_SIZE,
              offset: pageParam,
            }
          : {
              sort: "newest",
              q: search || undefined,
              ...filters,
              regionId: effectiveRegionId,
              districtId: effectiveDistrictId,
              limit: PAGE_SIZE,
              offset: pageParam,
            },
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  });

  // Ko'tarilgan (boost qilingan) e'lonlar har bir sahifada qayta qaytariladi,
  // shuning uchun sahifalarni birlashtirganda id bo'yicha takrorlarni olib
  // tashlaymiz - "tepadagilar yo'qolmaydi", faqat yangi 20 tasi qo'shiladi.
  const listings = listingsPages
    ? Array.from(new Map(listingsPages.pages.flat().map((l) => [l.id, l])).values())
    : undefined;

  const { data: featured } = useQuery({
    queryKey: ["listings", "featured"],
    queryFn: () => fetchListingFeed({ sort: "newest", boostedOnly: true }),
    enabled: !isSearching,
  });

  const { data: recentlyViewed } = useQuery({
    queryKey: ["listings", "recently-viewed"],
    queryFn: () => fetchListingsByIds(getRecentlyViewedIds()),
    enabled: !isSearching,
  });

  const featuredScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!featured || featured.length <= 1) return;
    const CARD_STEP_PX = 172; // w-40 (160px) + gap-3 (12px)
    const interval = setInterval(() => {
      const el = featuredScrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: CARD_STEP_PX, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [featured]);

  return (
    <div className="page" style={{ marginTop: "calc(-1 * var(--tg-safe-top))" }}>
      {/* Tashqi quti tepadan (0) yopishib turadi va o'zining bg-app foni bilan
          xavfsiz zonani ham to'ldiradi - shunda pin bo'lganda orqasidan hech
          narsa ko'rinmaydi. Ichki bo'sh joy (safe-top) shu qutining o'zida. */}
      <div
        className="sticky top-0 z-30 -mx-4 -mt-4 border-b border-divider bg-app px-4 pb-3"
        style={{ paddingTop: "calc(var(--tg-safe-top) + 1rem)" }}
      >
        <div className="flex items-center justify-between gap-2 pb-2.5">
          <img src="/kerak-logo.png" alt="Kerak" className="ml-2 h-9 w-auto shrink-0 dark:invert" />
          <RegionBannerTrigger onClick={() => setRegionPickerOpen(true)} />
        </div>
        <div className="flex items-center gap-2">
          <SearchBar onSearch={setSearch} />
          <NotificationBell />
          <LanguageSwitch />
        </div>
      </div>

      <RegionBanner open={regionPickerOpen} onOpenChange={setRegionPickerOpen} />

      {isSearching ? (
        <>
          {isLoading && <Spinner label={t("loading")} />}
          {error && <EmptyState icon={PackageSearch} title={t("home.loadError")} description={t("tryAgain")} />}
          {listings?.length === 0 && <EmptyState icon={PackageSearch} title={t("home.searchEmpty")} />}
          <div className="grid grid-cols-2 gap-3">
            {listings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="btn-secondary disabled:opacity-50"
            >
              {isFetchingNextPage ? t("loading") : t("home.loadMore")}
            </button>
          )}
        </>
      ) : (
        <>
          <BannerCarousel />

          {rootCategories.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="section-title">{t("home.categoriesTitle")}</h2>
              <CategoryScroller categories={rootCategories} />
            </section>
          )}

          <Link
            to="/requests"
            className="card flex items-center gap-3 border-promo/30 bg-promo/5 transition active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-promo/15 text-promo-dark">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-semibold text-ink">{t("home.requestsPromoTitle")}</span>
              <span className="text-xs text-hint">{t("home.requestsPromoSubtitle")}</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-hint" />
          </Link>

          {featured && featured.length > 0 && (
            <section className="panel-promo flex flex-col gap-2 rounded-2xl p-3 shadow-soft">
              <h2 className="flex items-center gap-1.5 text-base font-bold text-white">
                <Rocket className="h-4 w-4" />
                {t("home.featuredTitle")}
              </h2>
              <div ref={featuredScrollRef} className="no-scrollbar -mx-3 overflow-x-auto px-3">
                <div className="flex gap-3">
                  {featured.map((listing) => (
                    <div key={listing.id} className="w-40 shrink-0">
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {recentlyViewed && recentlyViewed.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="section-title-lg">{t("home.recentlyViewedTitle")}</h2>
              <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
                <div className="flex gap-3">
                  {recentlyViewed.map((listing) => (
                    <div key={listing.id} className="w-40 shrink-0">
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="section-title-lg">{t("home.recentTitle")}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <FeedFilters value={filters} onChange={setFilters} categories={categories} />
              {hasActiveSearch && (
                <button
                  type="button"
                  onClick={() => setSaveSearchOpen((v) => !v)}
                  className="pill flex items-center gap-1.5 border border-divider bg-surface text-hint shadow-soft"
                >
                  <BellPlus className="h-3.5 w-3.5" />
                  {t("savedSearch.save")}
                </button>
              )}
            </div>

            {saveSearchOpen && (
              <div className="card flex flex-col gap-2">
                <span className="text-xs text-hint">{t("savedSearch.hint")}</span>
                <input
                  value={searchLabel}
                  onChange={(e) => setSearchLabel(e.target.value)}
                  placeholder={search || t("savedSearch.defaultLabel")}
                  className="input"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setSaveSearchOpen(false)} className="btn-secondary">
                    {t("cancel")}
                  </button>
                  <button
                    onClick={() => saveSearchMutation.mutate()}
                    disabled={saveSearchMutation.isPending}
                    className="btn-primary disabled:opacity-50"
                  >
                    {saveSearchMutation.isPending ? t("saving") : t("save")}
                  </button>
                </div>
              </div>
            )}
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
              <EmptyState
                icon={PackageSearch}
                title={t("home.empty")}
                description={t("home.emptyHint")}
                action={
                  me?.regionId != null ? (
                    <button
                      type="button"
                      onClick={() => clearRegionMutation.mutate()}
                      disabled={clearRegionMutation.isPending}
                      className="btn-secondary disabled:opacity-50"
                    >
                      {clearRegionMutation.isPending ? t("loading") : t("home.showAllRegions")}
                    </button>
                  ) : undefined
                }
              />
            )}

            {view === "map" && listings ? (
              <ListingsMap
                listings={listings}
                myLocation={hasLocation ? { lat: me!.lat!, lng: me!.lng! } : null}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {listings?.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                {hasNextPage && (
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="btn-secondary disabled:opacity-50"
                  >
                    {isFetchingNextPage ? t("loading") : t("home.loadMore")}
                  </button>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
