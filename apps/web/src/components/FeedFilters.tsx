import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import type { CategoryDto } from "@kerak/shared";
import { REGIONS } from "../data/uzbekistanRegions";
import { useTranslation } from "../i18n/LanguageContext";

export interface FeedFilterValue {
  categoryId?: string;
  regionId?: number;
  districtId?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface FeedFiltersProps {
  value: FeedFilterValue;
  onChange: (value: FeedFilterValue) => void;
  categories?: CategoryDto[];
}

export function FeedFilters({ value, onChange, categories }: FeedFiltersProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FeedFilterValue>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const region = REGIONS.find((r) => r.id === draft.regionId);

  const activeCount = [value.categoryId, value.regionId, value.districtId, value.minPrice, value.maxPrice].filter(
    (v) => v !== undefined,
  ).length;

  const handleApply = () => {
    onChange(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft({});
    onChange({});
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`pill flex items-center gap-1.5 border border-divider bg-surface shadow-soft ${
          activeCount > 0 ? "text-brand" : "text-hint"
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {t("filters.button")}
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-contrast">
            {activeCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-2xl bg-app p-4 pb-6 isolate">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">{t("filters.title")}</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("cancel")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"
                >
                  <X className="h-4 w-4 text-hint" />
                </button>
              </div>

              {categories && (
                <label className="label">
                  {t("filters.category")}
                  <select
                    value={draft.categoryId ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value || undefined }))}
                    className="input"
                  >
                    <option value="">{t("filters.allCategories")}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.nameUz}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="label">
                {t("filters.region")}
                <select
                  value={draft.regionId ?? ""}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : undefined;
                    setDraft((d) => ({ ...d, regionId: id, districtId: undefined }));
                  }}
                  className="input"
                >
                  <option value="">{t("filters.allRegions")}</option>
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameUz}
                    </option>
                  ))}
                </select>
              </label>

              <label className="label">
                {t("filters.district")}
                <select
                  value={draft.districtId ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, districtId: e.target.value ? Number(e.target.value) : undefined }))
                  }
                  disabled={!region}
                  className="input disabled:opacity-50"
                >
                  <option value="">{t("filters.allDistricts")}</option>
                  {region?.districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.nameUz}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{t("filters.priceRange")}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder={t("filters.priceFrom")}
                    value={draft.minPrice ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, minPrice: e.target.value ? Number(e.target.value) : undefined }))
                    }
                    className="input"
                  />
                  <span className="text-hint">—</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder={t("filters.priceTo")}
                    value={draft.maxPrice ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, maxPrice: e.target.value ? Number(e.target.value) : undefined }))
                    }
                    className="input"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={handleReset} className="btn-secondary flex-1">
                  {t("filters.reset")}
                </button>
                <button type="button" onClick={handleApply} className="btn-primary flex-1">
                  {t("filters.apply")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
