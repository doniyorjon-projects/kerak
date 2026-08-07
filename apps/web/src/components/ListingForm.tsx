import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlignLeft,
  Banknote,
  Camera,
  ChevronDown,
  MapPin,
  Phone,
  Tag,
  Type,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CategoryType } from "@kerak/shared";
import type { CreateListingInput, ListingCondition } from "@kerak/shared";
import { fetchCategories } from "../api/categories";
import { uploadPhoto } from "../api/listings";
import { RegionDistrictPicker, type PlaceValue } from "./RegionDistrictPicker";
import { PhoneInput, phoneToDigits } from "./PhoneInput";
import { PriceInput } from "./PriceInput";
import { useTranslation } from "../i18n/LanguageContext";

export interface ListingFormInitialValues {
  categoryId: string;
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
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
  const isProduct = leafCategories.find((c) => c.id === categoryId)?.type === CategoryType.PRODUCT;

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [condition, setCondition] = useState<ListingCondition | null>(initial?.condition ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
  const [isNegotiable, setIsNegotiable] = useState(initial?.isNegotiable ?? false);
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

    onSubmit({
      categoryId,
      title,
      description,
      price: isNegotiable || !price ? null : Number(price),
      isNegotiable,
      photos,
      addressText: place.addressText,
      regionId: place.regionId,
      districtId: place.districtId,
      lat: place.lat,
      lng: place.lng,
      phone,
      condition: isProduct ? condition : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="card flex flex-col gap-4">
        <SectionHeader icon={Tag} title={t("create.category")} />
        <div className="relative">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input appearance-none pr-9"
          >
            <option value="">{t("create.selectCategory")}</option>
            {leafCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.nameUz}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
        </div>

        {isProduct && (
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
      </div>

      <div className="card flex flex-col gap-3">
        <SectionHeader icon={Banknote} title={t("create.priceSection")} />
        <div className="relative">
          <PriceInput
            value={price}
            onChange={setPrice}
            disabled={isNegotiable}
            className="input pr-14 text-base font-semibold disabled:opacity-50"
            placeholder="0"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-hint">
            {t("som")}
          </span>
        </div>
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
