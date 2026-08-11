import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Gift, SlidersHorizontal, Truck, Zap, X } from "lucide-react";
import { resolveCategoryFields } from "@kerak/shared";
import type { CategoryDto, ListingCondition } from "@kerak/shared";
import { REGIONS } from "../data/uzbekistanRegions";
import { CategoryPicker } from "./CategoryPicker";
import { useTranslation } from "../i18n/LanguageContext";

export interface FeedFilterValue {
  categoryId?: string;
  regionId?: number;
  districtId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition;
  isFree?: boolean;
  isUrgent?: boolean;
  hasDelivery?: boolean;
  attributes?: Record<string, string>;
  attributesAny?: Record<string, string>;
  attributesMin?: Record<string, string>;
  attributesMax?: Record<string, string>;
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
  const categoriesById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c] as const)), [categories]);
  const attributeFilterFields = useMemo(
    () => resolveCategoryFields(draft.categoryId, categoriesById).filter((f) => f.filterable),
    [draft.categoryId, categoriesById],
  );

  const activeCount =
    [
      value.categoryId,
      value.regionId,
      value.districtId,
      value.minPrice,
      value.maxPrice,
      value.condition,
      value.isFree ? true : undefined,
      value.isUrgent ? true : undefined,
      value.hasDelivery ? true : undefined,
    ].filter((v) => v !== undefined).length +
    Object.keys(value.attributes ?? {}).length +
    Object.keys(value.attributesAny ?? {}).length +
    Object.keys(value.attributesMin ?? {}).length +
    Object.keys(value.attributesMax ?? {}).length;

  const handleApply = () => {
    onChange(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft({});
    onChange({});
    setOpen(false);
  };

  const setAttribute = (key: string, val: string) => {
    setDraft((d) => {
      const next = { ...(d.attributes ?? {}) };
      if (val) next[key] = val;
      else delete next[key];
      return { ...d, attributes: Object.keys(next).length > 0 ? next : undefined };
    });
  };

  const setAttributeAny = (key: string, val: string) => {
    setDraft((d) => {
      const next = { ...(d.attributesAny ?? {}) };
      if (val && next[key] !== val) next[key] = val;
      else delete next[key];
      return { ...d, attributesAny: Object.keys(next).length > 0 ? next : undefined };
    });
  };

  const setAttributeRange = (mapKey: "attributesMin" | "attributesMax", key: string, val: string) => {
    setDraft((d) => {
      const next = { ...(d[mapKey] ?? {}) };
      if (val) next[key] = val;
      else delete next[key];
      return { ...d, [mapKey]: Object.keys(next).length > 0 ? next : undefined };
    });
  };

  const handleCategoryChange = (id: string) => {
    setDraft((d) => ({
      ...d,
      categoryId: id || undefined,
      attributes: undefined,
      attributesAny: undefined,
      attributesMin: undefined,
      attributesMax: undefined,
    }));
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
            <div
              className="absolute inset-0 bg-black/50 motion-safe:animate-[backdrop-fade-in_0.2s_ease-out]"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-2xl bg-app p-4 pb-6 isolate motion-safe:animate-[sheet-slide-up_0.28s_cubic-bezier(0.16,1,0.3,1)]">
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
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-ink">{t("filters.category")}</span>
                  <CategoryPicker
                    categories={categories}
                    value={draft.categoryId ?? ""}
                    onChange={handleCategoryChange}
                    allowClear
                  />
                </div>
              )}

              {attributeFilterFields.map((field) => {
                if (field.type === "boolean") {
                  const active = draft.attributes?.[field.key] === "true";
                  return (
                    <button
                      key={field.key}
                      type="button"
                      onClick={() => setAttribute(field.key, active ? "" : "true")}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                        active ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
                      }`}
                    >
                      {field.label}
                    </button>
                  );
                }
                if (field.type === "multiselect") {
                  return (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-ink">{field.label}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {field.options?.map((opt) => {
                          const active = draft.attributesAny?.[field.key] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAttributeAny(field.key, active ? "" : opt)}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                active ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                if (field.type === "number" || field.type === "decimal") {
                  return (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-ink">
                        {field.label}
                        {field.unit ? ` (${field.unit})` : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder={t("filters.priceFrom")}
                          value={draft.attributesMin?.[field.key] ?? ""}
                          onChange={(e) => setAttributeRange("attributesMin", field.key, e.target.value)}
                          className="input"
                        />
                        <span className="text-hint">—</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder={t("filters.priceTo")}
                          value={draft.attributesMax?.[field.key] ?? ""}
                          onChange={(e) => setAttributeRange("attributesMax", field.key, e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-ink">{field.label}</span>
                    <div className="relative">
                      <select
                        value={draft.attributes?.[field.key] ?? ""}
                        onChange={(e) => setAttribute(field.key, e.target.value)}
                        className="input appearance-none pr-9"
                      >
                        <option value="">{t("filters.any")}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{t("filters.region")}</span>
                <div className="relative">
                  <select
                    value={draft.regionId ?? ""}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : undefined;
                      setDraft((d) => ({ ...d, regionId: id, districtId: undefined }));
                    }}
                    className="input appearance-none pr-9"
                  >
                    <option value="">{t("filters.allRegions")}</option>
                    {REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nameUz}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{t("filters.district")}</span>
                <div className="relative">
                  <select
                    value={draft.districtId ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, districtId: e.target.value ? Number(e.target.value) : undefined }))
                    }
                    disabled={!region}
                    className="input appearance-none pr-9 disabled:opacity-50"
                  >
                    <option value="">{t("filters.allDistricts")}</option>
                    {region?.districts.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.nameUz}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
                </div>
              </div>

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

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{t("filters.condition")}</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, condition: undefined }))}
                    className={`rounded-xl py-2 text-xs font-semibold transition ${!draft.condition ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"}`}
                  >
                    {t("filters.allConditions")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, condition: "NEW" }))}
                    className={`rounded-xl py-2 text-xs font-semibold transition ${draft.condition === "NEW" ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"}`}
                  >
                    {t("create.conditionNew")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, condition: "USED" }))}
                    className={`rounded-xl py-2 text-xs font-semibold transition ${draft.condition === "USED" ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"}`}
                  >
                    {t("create.conditionUsed")}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{t("filters.extra")}</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, isFree: !d.isFree || undefined }))}
                    className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition ${
                      draft.isFree ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
                    }`}
                  >
                    <Gift className="h-3.5 w-3.5" />
                    {t("listing.isFreeBadge")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, isUrgent: !d.isUrgent || undefined }))}
                    className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition ${
                      draft.isUrgent ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {t("listing.isUrgentBadge")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, hasDelivery: !d.hasDelivery || undefined }))}
                    className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition ${
                      draft.hasDelivery ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
                    }`}
                  >
                    <Truck className="h-3.5 w-3.5" />
                    {t("listing.hasDeliveryBadge")}
                  </button>
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
