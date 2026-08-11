import { useState } from "react";
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
  Phone,
  Sparkles,
  Tag,
  Truck,
  Type,
  Zap,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES_WITHOUT_CONDITION, CATEGORY_ATTRIBUTES, CategoryType, UNLIMITED_LISTINGS } from "@kerak/shared";
import type { CreateListingInput, ListingCondition } from "@kerak/shared";
import { fetchCategories } from "../api/categories";
import { uploadPhoto } from "../api/listings";
import { fetchPublicSettings } from "../api/settings";
import { generateAiDescription } from "../api/ai";
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
  attributes?: Record<string, string> | null;
  price: number | null;
  priceUsd?: number | null;
  isNegotiable: boolean;
  isFree?: boolean;
  isUrgent?: boolean;
  hasDelivery?: boolean;
  phone: string;
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

export function ListingForm({ initial, onSubmit, isSubmitting, submitLabel, submitError }: ListingFormProps) {
  const { t } = useTranslation();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const leafCategories = (categories ?? []).filter((c) => c.parentId);
  const { data: publicSettings } = useQuery({ queryKey: ["public-settings"], queryFn: fetchPublicSettings });
  const usdRate = publicSettings?.usdRate ?? 12700;
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const canUseAi = Boolean(me && me.listingsLimit >= UNLIMITED_LISTINGS);

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [condition, setCondition] = useState<ListingCondition | null>(initial?.condition ?? null);
  const selectedCategory = leafCategories.find((c) => c.id === categoryId);
  const isProduct = selectedCategory?.type === CategoryType.PRODUCT;
  const showCondition = isProduct && !CATEGORIES_WITHOUT_CONDITION.has(selectedCategory?.nameUz ?? "");
  const attributeFields = selectedCategory ? (CATEGORY_ATTRIBUTES[selectedCategory.nameUz] ?? []) : [];
  const [title, setTitle] = useState(initial?.title ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [attributes, setAttributes] = useState<Record<string, string>>(initial?.attributes ?? {});
  const [description, setDescription] = useState(initial?.description ?? "");

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    const newCategory = leafCategories.find((c) => c.id === newCategoryId);
    const newFields = newCategory ? (CATEGORY_ATTRIBUTES[newCategory.nameUz] ?? []) : [];
    const allowedKeys = new Set(newFields.map((f) => f.key));
    setAttributes((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => allowedKeys.has(key))));
  };

  const aiDescriptionMutation = useMutation({
    mutationFn: () => {
      const categoryName = leafCategories.find((c) => c.id === categoryId)?.nameUz;
      return generateAiDescription(title, categoryName, description || undefined);
    },
    onSuccess: (result) => setDescription(result.description.slice(0, 2000)),
  });
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
  const [priceCurrency, setPriceCurrency] = useState<"UZS" | "USD">(initial?.priceUsd != null ? "USD" : "UZS");
  const [usdPrice, setUsdPrice] = useState(initial?.priceUsd != null ? String(initial.priceUsd) : "");
  const [isNegotiable, setIsNegotiable] = useState(initial?.isNegotiable ?? false);
  const [isFree, setIsFree] = useState(initial?.isFree ?? false);
  const [isUrgent, setIsUrgent] = useState(initial?.isUrgent ?? false);
  const [hasDelivery, setHasDelivery] = useState(initial?.hasDelivery ?? false);
  const [phone, setPhone] = useState(initial?.phone ?? "");
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

    const filledAttributes = Object.fromEntries(
      Object.entries(attributes).filter(([, value]) => value.trim().length > 0),
    );

    onSubmit({
      categoryId,
      title,
      description,
      brand: isProduct && brand.trim() ? brand.trim() : null,
      attributes: Object.keys(filledAttributes).length > 0 ? filledAttributes : null,
      price: isFree || isNegotiable || !price ? null : Number(price),
      priceUsd: isFree || isNegotiable || priceCurrency !== "USD" || !usdPrice ? null : Number(usdPrice),
      isNegotiable: isFree ? false : isNegotiable,
      isFree,
      isUrgent,
      hasDelivery,
      photos,
      addressText: place.addressText,
      regionId: place.regionId,
      districtId: place.districtId,
      lat: place.lat,
      lng: place.lng,
      phone,
      condition: showCondition ? condition : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="card flex flex-col gap-4">
        <SectionHeader icon={Tag} title={t("create.category")} />
        <div className="relative">
          <select
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input appearance-none pr-9"
          >
            <option value="">{t("create.selectCategory")}</option>
            {(categories ?? [])
              .filter((c) => !c.parentId)
              .map((root) => (
                <optgroup key={root.id} label={`${root.icon ?? ""} ${root.nameUz}`}>
                  {(categories ?? [])
                    .filter((c) => c.parentId === root.id)
                    .map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.icon} {child.nameUz}
                      </option>
                    ))}
                </optgroup>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
        </div>

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

        {isProduct && (
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value.slice(0, 60))}
            className="input"
            placeholder={t("create.brandPlaceholder")}
          />
        )}

        {attributeFields.length > 0 && (
          <>
            <div className="h-px bg-divider" />
            <SectionHeader icon={ListChecks} title={t("create.attributes")} />
            <div className="grid grid-cols-2 gap-2">
              {attributeFields.map((field) => (
                <div
                  key={field.key}
                  className={field.type === "text" ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}
                >
                  <span className="text-xs text-hint">{field.label}</span>
                  {field.type === "select" ? (
                    <div className="relative">
                      <select
                        value={attributes[field.key] ?? ""}
                        onChange={(e) =>
                          setAttributes((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
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
                        type={field.type === "number" ? "number" : "text"}
                        inputMode={field.type === "number" ? "numeric" : undefined}
                        value={attributes[field.key] ?? ""}
                        onChange={(e) =>
                          setAttributes((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
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
              ))}
            </div>
          </>
        )}

        <div className="h-px bg-divider" />

        <SectionHeader icon={Type} title={t("create.listingTitle")} hint={`${title.length}/120`} />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 120))}
          className="input"
          placeholder={t("create.titlePlaceholder")}
        />

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
        <PhoneInput value={phone} onChange={setPhone} />
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
