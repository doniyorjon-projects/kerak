import { useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, MapPin, X } from "lucide-react";
import { fetchMe, updateLocation } from "../api/users";
import { RegionDistrictPicker, type PlaceValue } from "./RegionDistrictPicker";
import { findNearestPlace } from "../utils/nearestRegion";
import { useTranslation } from "../i18n/LanguageContext";

/**
 * Uzum Market'dagi kabi past-profilli "yetkazib beriladigan hudud" chizig'i
 * (har safar bloklaydigan popup emas) va BirBir'dagi kabi hududni tez
 * o'zgartirish imkoni - ikkalasining eng qulay tomonlarini birlashtirgan.
 */
export function RegionBanner() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const [open, setOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => updateLocation(lat, lng),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      setOpen(false);
    },
  });

  if (!me) return null;

  const place = me.lat != null && me.lng != null ? findNearestPlace(me.lat, me.lng) : null;
  const label = place ? (place.district ? place.district.nameUz : place.region.nameUz) : null;

  const handlePlaceChange = (value: PlaceValue | null) => {
    if (value) updateMutation.mutate({ lat: value.lat, lng: value.lng });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-fit items-center gap-1 text-xs text-hint transition active:opacity-70"
      >
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

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div
              className="absolute inset-0 bg-black/50 motion-safe:animate-[backdrop-fade-in_0.2s_ease-out]"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-2xl bg-app p-4 pb-6 motion-safe:animate-[sheet-slide-up_0.28s_cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">{t("region.pickerTitle")}</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("cancel")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"
                >
                  <X className="h-4 w-4 text-hint" />
                </button>
              </div>
              <RegionDistrictPicker onChange={handlePlaceChange} />
              {updateMutation.isPending && <span className="text-xs text-hint">{t("saving")}</span>}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
