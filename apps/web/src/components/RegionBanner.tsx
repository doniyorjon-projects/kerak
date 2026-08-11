import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, LocateFixed, MapPin, Search, X } from "lucide-react";
import { fetchMe, updateLocation } from "../api/users";
import { REGIONS, type Region } from "../data/uzbekistanRegions";
import { findNearestPlace } from "../utils/nearestRegion";
import { useTranslation } from "../i18n/LanguageContext";

type Selection = "ALL" | { regionId: number; districtId: number | null };

function resolveLatLng(selection: Selection): { lat: number | null; lng: number | null } {
  if (selection === "ALL") return { lat: null, lng: null };
  const region = REGIONS.find((r) => r.id === selection.regionId);
  if (!region) return { lat: null, lng: null };
  const district = selection.districtId != null ? region.districts.find((d) => d.id === selection.districtId) : null;
  return district ? { lat: district.lat, lng: district.lng } : { lat: region.lat, lng: region.lng };
}

function RadioRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between py-3 text-left active:opacity-70"
    >
      <span className={`text-sm ${checked ? "font-semibold text-ink" : "text-ink"}`}>{label}</span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-brand" : "border-divider"
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
      </span>
    </button>
  );
}

interface RegionBannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * BirBir'ning "shahar/hudud tanlash" oynasidagi tuzilishdan ilhomlanilgan
 * (search + ro'yxat + ichiga kirish), lekin bizning dizayn kodimizga
 * (pastdan chiqadigan panel, radio qatorlar, brand rangi) moslashtirilgan.
 * Profil sahifasidagi alohida joylashuv bo'limi endi shu yerga birlashtirildi.
 */
export function RegionBanner({ open, onOpenChange }: RegionBannerProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [pending, setPending] = useState<Selection>("ALL");
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({ lat, lng }: { lat: number | null; lng: number | null }) => updateLocation(lat, lng),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setActiveRegion(null);
    setGeoError(null);
    if (me?.lat != null && me?.lng != null) {
      const place = findNearestPlace(me.lat, me.lng);
      setPending(place ? { regionId: place.region.id, districtId: place.district?.id ?? null } : "ALL");
    } else {
      setPending("ALL");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(t("profile.geoUnsupported"));
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        updateMutation.mutate({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setLocating(false);
        setGeoError(t("profile.geoFailed"));
      },
    );
  };

  const searchResults =
    search.trim().length > 0
      ? REGIONS.flatMap((region) => {
          const q = search.trim().toLowerCase();
          const items: { label: string; selection: Selection }[] = [];
          if (region.nameUz.toLowerCase().includes(q)) {
            items.push({ label: region.nameUz, selection: { regionId: region.id, districtId: null } });
          }
          for (const district of region.districts) {
            if (district.nameUz.toLowerCase().includes(q)) {
              items.push({
                label: `${district.nameUz}, ${region.nameUz}`,
                selection: { regionId: region.id, districtId: district.id },
              });
            }
          }
          return items;
        })
      : null;

  const handleApply = () => {
    updateMutation.mutate(resolveLatLng(pending));
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 motion-safe:animate-[backdrop-fade-in_0.2s_ease-out]"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-app motion-safe:animate-[sheet-slide-up_0.28s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          {activeRegion && !search ? (
            <button
              type="button"
              onClick={() => setActiveRegion(null)}
              aria-label={t("region.back")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"
            >
              <ChevronLeft className="h-4 w-4 text-hint" />
            </button>
          ) : (
            <span className="w-8" />
          )}
          <h2 className="truncate text-base font-bold text-ink">
            {activeRegion && !search ? activeRegion.nameUz : t("region.pickerTitle")}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={t("cancel")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"
          >
            <X className="h-4 w-4 text-hint" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("region.searchPlaceholder")}
              className="input pl-10"
            />
          </div>
        </div>

        {!search && (
          <div className="px-4 pb-2">
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="flex items-center gap-1.5 text-sm font-medium text-brand disabled:opacity-50"
            >
              <LocateFixed className="h-4 w-4" />
              {locating ? t("profile.detecting") : t("region.enableGeo")}
            </button>
            {geoError && <span className="mt-1 block text-xs text-destructive">{geoError}</span>}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4">
          {searchResults ? (
            searchResults.length === 0 ? (
              <p className="py-6 text-center text-sm text-hint">{t("region.noResults")}</p>
            ) : (
              <div className="flex flex-col divide-y divide-divider">
                {searchResults.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      updateMutation.mutate(resolveLatLng(item.selection));
                    }}
                    className="flex items-center gap-2 py-3 text-left text-sm text-ink active:opacity-70"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-hint" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            )
          ) : activeRegion ? (
            <div className="flex flex-col divide-y divide-divider">
              <RadioRow
                label={t("region.wholeRegion")}
                checked={pending !== "ALL" && pending.regionId === activeRegion.id && pending.districtId == null}
                onClick={() => setPending({ regionId: activeRegion.id, districtId: null })}
              />
              {activeRegion.districts.map((district) => (
                <RadioRow
                  key={district.id}
                  label={district.nameUz}
                  checked={pending !== "ALL" && pending.regionId === activeRegion.id && pending.districtId === district.id}
                  onClick={() => setPending({ regionId: activeRegion.id, districtId: district.id })}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-divider">
              <RadioRow label={t("region.allRegions")} checked={pending === "ALL"} onClick={() => setPending("ALL")} />
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setActiveRegion(region)}
                  className="flex w-full items-center justify-between py-3 text-left active:opacity-70"
                >
                  <span
                    className={`text-sm ${pending !== "ALL" && pending.regionId === region.id ? "font-semibold text-brand" : "text-ink"}`}
                  >
                    {region.nameUz}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-hint" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-divider p-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <button
            type="button"
            onClick={handleApply}
            disabled={updateMutation.isPending}
            className="btn-primary w-full disabled:opacity-50"
          >
            {updateMutation.isPending ? t("saving") : t("region.apply")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function RegionBannerTrigger({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const place = me?.lat != null && me?.lng != null ? findNearestPlace(me.lat, me.lng) : null;
  const label = place ? (place.district?.nameUz ?? place.region.nameUz) : null;

  return (
    <button type="button" onClick={onClick} className="flex w-fit items-center gap-1 text-xs text-hint transition active:opacity-70">
      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
      {label ? (
        <>
          <span className="text-ink">{label}</span>
          <span className="text-brand">· {t("region.change")}</span>
        </>
      ) : (
        <span className="text-brand underline">{t("region.selectPrompt")}</span>
      )}
      <ChevronRight className="h-3 w-3 shrink-0" />
    </button>
  );
}
