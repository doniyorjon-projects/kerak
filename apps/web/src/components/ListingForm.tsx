import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlignLeft,
  Banknote,
  Camera,
  ChevronDown,
  Gift,
  ListChecks,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Store,
  Tag,
  Truck,
  Type,
  Zap,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { UNLIMITED_LISTINGS, resolveCategoryFields } from "@kerak/shared";
import type { AttributeValue, CategoryDto, CreateListingInput, ListingCondition, SellerType } from "@kerak/shared";
import { CategoryPicker } from "./CategoryPicker";
import { fetchCategories } from "../api/categories";
import { uploadPhoto } from "../api/listings";
import { fetchPublicSettings } from "../api/settings";
import { generateAiDescription, suggestCategory } from "../api/ai";
import { fetchMe } from "../api/users";
import { RegionDistrictPicker, type PlaceValue } from "./RegionDistrictPicker";
import { PhoneInput, phoneToDigits } from "./PhoneInput";
import { PriceInput } from "./PriceInput";
import { useTranslation } from "../i18n/LanguageContext";

export interface ListingFormInitialValues {
  categoryId: string;
  title: string;
  description: string;
  brand?: string | null;
  attributes?: Record<string, AttributeValue> | null;
  price: number | null;
  priceUsd?: number | null;
  isNegotiable: boolean;
  isFree?: boolean;
  isUrgent?: boolean;
  hasDelivery?: boolean;
  sellerType?: SellerType | null;
  contactTelegram?: boolean;
  phone: string;
  contactName?: string | null;
  photos: string[];
  addressText: string | null;
  condition?: ListingCondition | null;
}

interface ListingFormProps {
  initial?: ListingFormInitialValues;
  onSubmit: (payload: CreateListingInput) => void;
  isSubmitting: boolean;
  submitLabel: string;
  submitError?: string | null;
}

function SectionHeader({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-ink">{title}</span>
      </div>
      {hint && <span className="text-xs text-hint">{hint}</span>}
    </div>
  );
}

function attributesToFormValues(attributes: Record<string, AttributeValue> | null | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!attributes) return result;
  for (const [key, value] of Object.entries(attributes)) {
    if (!Array.isArray(value)) result[key] = String(value);
  }
  return result;
}

function attributesToMultiselectValues(attributes: Record<string, AttributeValue> | null | undefined): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  if (!attributes) return result;
  for (const [key, value] of Object.entries(attributes)) {
    if (Array.isArray(value)) result[key] = value;
  }
  return result;
}

export function ListingForm({ initial, onSubmit, isSubmitting, submitLabel, submitError }: ListingFormProps) {
  const { t } = useTranslation();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const categoriesById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c] as const)), [categories]);
  const { data: publicSettings } = useQuery({ queryKey: ["public-settings"], queryFn: fetchPublicSettings });
  const usdRate = publicSettings?.usdRate ?? 12700;
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const canUseAi = Boolean(me && me.listingsLimit >= UNLIMITED_LISTINGS);

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [condition, setCondition] = useState<ListingCondition | null>(initial?.condition ?? null);
  const selectedCategory: CategoryDto | undefined = categoriesById.get(categoryId);
  const resolvedFields = useMemo(() => resolveCategoryFields(categoryId || undefined, categoriesById), [categoryId, categoriesById]);
  const showCondition = resolvedFields.some((f) => f.key === "condition");
  const brandField = resolvedFields.find((f) => f.key === "brand");
  const attributeFields = resolvedFields.filter((f) => f.key !== "condition" && f.key !== "brand");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [attributes, setAttributes] = useState<Record<string, string>>(attributesToFormValues(initial?.attributes));
  const [multiselectAttributes, setMultiselectAttributes] = useState<Record<string, string[]>>(
    attributesToMultiselectValues(initial?.attributes),
  );
  const [description, setDescription] = useState(initial?.description ?? "");

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    const newFields = resolveCategoryFields(newCategoryId, categoriesById);
    const allowedKeys = new Set(newFields.map((f) => f.key));
    setAttributes((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => allowedKeys.has(key))));
    setMultiselectAttributes((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => allowedKeys.has(key))));
    if (!allowedKeys.has("brand")) setBrand("");
  };

  const toggleMultiselectOption = (key: string, option: string) => {
    setMultiselectAttributes((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
      return { ...prev, [key]: next };
    });
  };

  const [dismissedSuggestionFor, setDismissedSuggestionFor] = useState<string | null>(null);
  const categorySuggestionMutation = useMutation({ mutationFn: (t: string) => suggestCategory(t) });

  useEffect(() => {
    if (categoryId || title.trim().length < 3 || dismissedSuggestionFor === title) return;
    const handle = setTimeout(() => categorySuggestionMutation.mutate(title), 800);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, categoryId]);

  const suggestedCategory =
    !categoryId && categorySuggestionMutation.data?.categoryId
      ? categoriesById.get(categorySuggestionMutation.data.categoryId)
      : undefined;

  const aiDescriptionMutation = useMutation({
    mutationFn: () => generateAiDescription(title, selectedCategory?.nameUz, description || undefined),
    onSuccess: (result) => setDescription(result.description.slice(0, 2000)),
  });
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
  const [priceCurrency, setPriceCurrency] = useState<"UZS" | "USD">(initial?.priceUsd != null ? "USD" : "UZS");
  const [usdPrice, setUsdPrice] = useState(initial?.priceUsd != null ? String(initial.priceUsd) : "");
  const [isNegotiable, setIsNegotiable] = useState(initial?.isNegotiable ?? false);
  const [isFree, setIsFree] = useState(initial?.isFree ?? false);
  const [isUrgent, setIsUrgent] = useState(initial?.isUrgent ?? false);
  const [hasDelivery, setHasDelivery] = useState(initial?.hasDelivery ?? false);
  const [sellerType, setSellerType] = useState<SellerType | null>(initial?.sellerType ?? null);
  const [contactTelegram, setContactTelegram] = useState(initial?.contactTelegram ?? true);
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [contactName, setContactName] = useState(initial?.contactName ?? "");
  useEffect(() => {
    if (!initial?.contactName && !contactName && me?.firstName) setContactName(me.firstName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);
  const [place, setPlace] = useState<PlaceValue | null>(null);
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((file) => uploadPhoto(file)));
      setPhotos((prev) => [...prev, ...uploaded.map((u) => u.url)].slice(0, 8));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("create.errPhoto"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = (url: string) => setPhotos((prev) => prev.filter((p) => p !== url));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!categoryId) return setFormError(t("create.errCategory"));
    if (!place) return setFormError(t("create.errPlace"));
    if (!phone) return setFormError(t("create.errPhone"));
    if (phoneToDigits(phone).length !== 9) return setFormError(t("create.errPhoneIncomplete"));

    const finalAttributes: Record<string, AttributeValue> = {};
    for (const field of attributeFields) {
      if (field.type === "multiselect") {
        const values = multiselectAttributes[field.key];
        if (values && values.length > 0) finalAttributes[field.key] = values;
        continue;
      }
      const raw = attributes[field.key];
      if (raw === undefined || raw === "") continue;
      if (field.type === "boolean") {
        if (raw === "true") finalAttributes[field.key] = true;
      } else if (field.type === "number" || field.type === "decimal") {
        const num = Number(raw);
        if (Number.isFinite(num)) finalAttributes[field.key] = num;
      } else {
        finalAttributes[field.key] = raw;
      }
    }

    onSubmit({
      categoryId,
      title,
      description,
      brand: brandField && brand.trim() ? brand.trim() : null,
      attributes: Object.keys(finalAttributes).length > 0 ? finalAttributes : null,
      price: isFree || isNegotiable || !price ? null : Number(price),
      priceUsd: isFree || isNegotiable || priceCurrency !== "USD" || !usdPrice ? null : Number(usdPrice),
      isNegotiable: isFree ? false : isNegotiable,
      isFree,
      isUrgent,
      hasDelivery,
      sellerType,
      contactTelegram,
      photos,
      addressText: place.addressText,
      regionId: place.regionId,
      districtId: place.districtId,
      lat: place.lat,
      lng: place.lng,
      phone,
      contactName: contactName.trim() || null,
      condition: showCondition ? condition : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="card flex flex-col gap-4">
        <SectionHeader icon={Type} title={t("create.listingTitle")} hint={`${title.length}/120`} />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 120))}
          className="input"
          placeholder={t("create.titlePlaceholder")}
        />
        {suggestedCategory && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-brand/10 px-3 py-2">
            <span className="flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-brand">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {t("create.categorySuggestion")}: {suggestedCategory.icon} {suggestedCategory.nameUz}
              </span>
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCategoryChange(suggestedCategory.id)}
                className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-contrast active:scale-[0.98]"
              >
                {t("create.applySuggestion")}
              </button>
              <button
                type="button"
                onClick={() => setDismissedSuggestionFor(title)}
                aria-label={t("cancel")}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-brand"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="h-px bg-divider" />

        <SectionHeader icon={AlignLeft} title={t("create.description")} hint={`${description.length}/2000`} />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
          className="input min-h-28 resize-none"
          placeholder={t("create.descriptionPlaceholder")}
        />
        {canUseAi && (
          <button
            type="button"
            onClick={() => aiDescriptionMutation.mutate()}
            disabled={!title.trim() || aiDescriptionMutation.isPending}
            className="flex w-fit items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {aiDescriptionMutation.isPending ? t("create.aiGenerating") : t("create.aiGenerate")}
          </button>
        )}
        {aiDescriptionMutation.isError && (
          <span className="text-xs text-destructive">{aiDescriptionMutation.error.message}</span>
        )}
      </div>

      <div className="card flex flex-col gap-4">
        <SectionHeader icon={Tag} title={t("create.category")} />
        <CategoryPicker categories={categories ?? []} value={categoryId} onChange={handleCategoryChange} />

        {showCondition && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCondition("NEW")}
              className={`rounded-xl py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                condition === "NEW" ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
              }`}
            >
              {t("create.conditionNew")}
            </button>
            <button
              type="button"
              onClick={() => setCondition("USED")}
              className={`rounded-xl py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                condition === "USED" ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
              }`}
            >
              {t("create.conditionUsed")}
            </button>
          </div>
        )}

        {brandField &&
          (brandField.type === "select" ? (
            <div className="relative">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="input appearance-none pr-9"
              >
                <option value="">{brandField.label}</option>
                {brandField.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
            </div>
          ) : (
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value.slice(0, 60))}
              className="input"
              placeholder={t("create.brandPlaceholder")}
            />
          ))}

        {attributeFields.length > 0 && (
          <>
            <div className="h-px bg-divider" />
            <SectionHeader icon={ListChecks} title={t("create.attributes")} />
            <div className="grid grid-cols-2 gap-2">
              {attributeFields.map((field) => {
                const fullWidth = field.type === "text" || field.type === "multiselect" || field.type === "range" || field.type === "boolean";
                if (field.type === "boolean") {
                  const checked = attributes[field.key] === "true";
                  return (
                    <label
                      key={field.key}
                      className="col-span-2 flex cursor-pointer items-center justify-between rounded-xl bg-surface-secondary px-3.5 py-2.5"
                    >
                      <span className="text-sm text-ink">{field.label}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        onClick={() => setAttributes((prev) => ({ ...prev, [field.key]: checked ? "false" : "true" }))}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand" : "bg-divider"}`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
                        />
                      </button>
                    </label>
                  );
                }
                if (field.type === "multiselect") {
                  const selectedValues = multiselectAttributes[field.key] ?? [];
                  return (
                    <div key={field.key} className="col-span-2 flex flex-col gap-1">
                      <span className="text-xs text-hint">{field.label}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {field.options?.map((opt) => {
                          const active = selectedValues.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleMultiselectOption(field.key, opt)}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-[0.98] ${
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
                if (field.type === "range") {
                  const [rangeMin, rangeMax] = (attributes[field.key] ?? "-").split("-");
                  const setRange = (min: string, max: string) =>
                    setAttributes((prev) => ({ ...prev, [field.key]: min || max ? `${min}-${max}` : "" }));
                  return (
                    <div key={field.key} className="col-span-2 flex flex-col gap-1">
                      <span className="text-xs text-hint">
                        {field.label}
                        {field.unit ? ` (${field.unit})` : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={rangeMin ?? ""}
                          onChange={(e) => setRange(e.target.value, rangeMax ?? "")}
                          className="input"
                          placeholder={t("create.rangeMin")}
                        />
                        <span className="shrink-0 text-xs text-hint">{t("create.rangeTo")}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={rangeMax ?? ""}
                          onChange={(e) => setRange(rangeMin ?? "", e.target.value)}
                          className="input"
                          placeholder={t("create.rangeMax")}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={field.key} className={fullWidth ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
                    <span className="text-xs text-hint">{field.label}</span>
                    {field.type === "select" ? (
                      <div className="relative">
                        <select
                          value={attributes[field.key] ?? ""}
                          onChange={(e) => setAttributes((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="input appearance-none pr-9"
                        >
                          <option value="">—</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type === "number" || field.type === "decimal" ? "number" : "text"}
                          inputMode={field.type === "number" ? "numeric" : field.type === "decimal" ? "decimal" : undefined}
                          value={attributes[field.key] ?? ""}
                          onChange={(e) => setAttributes((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className={field.unit ? "input pr-12" : "input"}
                          placeholder={field.placeholder}
                        />
                        {field.unit && (
                          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-hint">
                            {field.unit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <SectionHeader icon={Banknote} title={t("create.priceSection")} />

        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface-secondary px-3.5 py-2.5">
          <span className="flex items-center gap-1.5 text-sm text-ink">
            <Gift className="h-4 w-4 text-success-dark" />
            {t("create.isFree")}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isFree}
            onClick={() => setIsFree((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isFree ? "bg-brand" : "bg-divider"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${isFree ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
        </label>

        {!isFree && (
          <>
            <div className="flex items-center justify-end gap-2.5">
              <div className="flex shrink-0 gap-1 rounded-full bg-surface-secondary p-0.5">
                <button
                  type="button"
                  disabled={isNegotiable}
                  onClick={() => setPriceCurrency("UZS")}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                    priceCurrency === "UZS" ? "bg-brand text-brand-contrast" : "text-hint"
                  }`}
                >
                  {t("som")}
                </button>
                <button
                  type="button"
                  disabled={isNegotiable}
                  onClick={() => {
                    setUsdPrice(price ? String(Math.round(Number(price) / usdRate)) : "");
                    setPriceCurrency("USD");
                  }}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                    priceCurrency === "USD" ? "bg-brand text-brand-contrast" : "text-hint"
                  }`}
                >
                  $
                </button>
              </div>
            </div>
            <div className="relative">
              {priceCurrency === "USD" ? (
                <PriceInput
                  value={usdPrice}
                  onChange={(digits) => {
                    setUsdPrice(digits);
                    setPrice(digits ? String(Math.round(Number(digits) * usdRate)) : "");
                  }}
                  disabled={isNegotiable}
                  className="input pr-10 text-base font-semibold disabled:opacity-50"
                  placeholder="0"
                />
              ) : (
                <PriceInput
                  value={price}
                  onChange={setPrice}
                  disabled={isNegotiable}
                  className="input pr-14 text-base font-semibold disabled:opacity-50"
                  placeholder="0"
                />
              )}
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-hint">
                {priceCurrency === "USD" ? "$" : t("som")}
              </span>
            </div>
            {priceCurrency === "USD" && price && (
              <span className="text-xs text-hint">
                ≈ {Number(price).toLocaleString("uz-UZ")} {t("som")}
              </span>
            )}
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface-secondary px-3.5 py-2.5">
              <span className="text-sm text-ink">{t("negotiable")}</span>
              <button
                type="button"
                role="switch"
                aria-checked={isNegotiable}
                onClick={() => setIsNegotiable((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isNegotiable ? "bg-brand" : "bg-divider"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${isNegotiable ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
            </label>
          </>
        )}
      </div>

      <div className="card flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsUrgent((v) => !v)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-center text-sm font-semibold leading-tight transition active:scale-[0.98] ${
              isUrgent ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
            }`}
          >
            <Zap className="h-4 w-4 shrink-0" />
            <span>{t("create.isUrgent")}</span>
          </button>
          <button
            type="button"
            onClick={() => setHasDelivery((v) => !v)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-center text-sm font-semibold leading-tight transition active:scale-[0.98] ${
              hasDelivery ? "bg-brand text-brand-contrast" : "bg-surface-secondary text-ink"
            }`}
          >
            <Truck className="h-4 w-4 shrink-0" />
            <span>{t("create.hasDelivery")}</span>
          </button>
        </div>
      </div>

      <div className="card flex flex-col gap-3">
        <SectionHeader icon={MapPin} title={t("create.address")} />
        <RegionDistrictPicker onChange={setPlace} initialAddressText={initial?.addressText} />
      </div>

      <div className="card flex flex-col gap-3">
        <SectionHeader icon={Phone} title={t("create.phone")} />
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value.slice(0, 60))}
          className="input"
          placeholder={t("create.contactNamePlaceholder")}
        />
        <PhoneInput value={phone} onChange={setPhone} />

        <div className="h-px bg-divider" />

        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-sm text-ink">
            <Store className="h-4 w-4 text-hint" />
            {t("create.sellerType")}
          </span>
          <div className="flex gap-1 rounded-full bg-surface-secondary p-0.5">
            <button
              type="button"
              onClick={() => setSellerType("PRIVATE")}
              className={`flex-1 rounded-full py-1.5 text-xs font-medium transition ${
                sellerType === "PRIVATE" ? "bg-brand text-brand-contrast" : "text-hint"
              }`}
            >
              {t("create.sellerTypePrivate")}
            </button>
            <button
              type="button"
              onClick={() => setSellerType("BUSINESS")}
              className={`flex-1 rounded-full py-1.5 text-xs font-medium transition ${
                sellerType === "BUSINESS" ? "bg-brand text-brand-contrast" : "text-hint"
              }`}
            >
              {t("create.sellerTypeBusiness")}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface-secondary px-3.5 py-2.5">
          <span className="flex items-center gap-1.5 text-sm text-ink">
            <MessageCircle className="h-4 w-4 text-hint" />
            {t("create.contactTelegram")}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={contactTelegram}
            onClick={() => setContactTelegram((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${contactTelegram ? "bg-brand" : "bg-divider"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${contactTelegram ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
        </label>
      </div>

      <div className="card flex flex-col gap-3">
        <SectionHeader icon={Camera} title={t("create.photos")} hint={`${photos.length}/8`} />
        <div className="grid grid-cols-4 gap-2">
          {photos.map((url, idx) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-divider">
              <img src={url} className="h-full w-full object-cover" />
              {idx === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-semibold text-brand-contrast">
                  {t("create.mainPhoto")}
                </span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 8 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-divider text-hint transition active:scale-[0.97]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-medium">{uploading ? t("sending") : t("create.addPhoto")}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={handlePhotoChange}
              />
            </label>
          )}
        </div>
      </div>

      {(formError || submitError) && (
        <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 translate-y-0.5" />
          <span>{formError || submitError}</span>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary py-3.5 text-base">
        {isSubmitting ? t("sending") : submitLabel}
      </button>
    </form>
  );
}
