import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
import type { CreateListingInput } from "@kerak/shared";
import { fetchCategories } from "../api/categories";
import { uploadPhoto } from "../api/listings";
import { RegionDistrictPicker, type PlaceValue } from "./RegionDistrictPicker";
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
}

interface ListingFormProps {
  initial?: ListingFormInitialValues;
  onSubmit: (payload: CreateListingInput) => void;
  isSubmitting: boolean;
  submitLabel: string;
  submitError?: string | null;
}

export function ListingForm({ initial, onSubmit, isSubmitting, submitLabel, submitError }: ListingFormProps) {
  const { t } = useTranslation();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const leafCategories = (categories ?? []).filter((c) => c.parentId);

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
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
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="card flex flex-col gap-3">
        <label className="label">
          {t("create.category")}
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
            <option value="">{t("create.selectCategory")}</option>
            {leafCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.nameUz}
              </option>
            ))}
          </select>
        </label>

        <label className="label">
          {t("create.listingTitle")}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder={t("create.titlePlaceholder")}
          />
        </label>

        <label className="label">
          {t("create.description")}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-24"
            placeholder={t("create.descriptionPlaceholder")}
          />
        </label>
      </div>

      <div className="card flex flex-col gap-3">
        <span className="section-title">{t("create.priceSection")}</span>
        <div className="flex items-end gap-3">
          <label className="label flex-1">
            {t("create.price")}
            <input
              type="number"
              value={price}
              disabled={isNegotiable}
              onChange={(e) => setPrice(e.target.value)}
              className="input disabled:opacity-50"
            />
          </label>
          <label className="flex items-center gap-2 pb-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={isNegotiable}
              onChange={(e) => setIsNegotiable(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            {t("negotiable")}
          </label>
        </div>
      </div>

      <div className="card flex flex-col gap-3">
        <span className="section-title">{t("create.address")}</span>
        <RegionDistrictPicker onChange={setPlace} initialAddressText={initial?.addressText} />
      </div>

      <div className="card flex flex-col gap-3">
        <label className="label">
          {t("create.phone")}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder={t("create.phonePlaceholder")}
          />
        </label>
      </div>

      <div className="card flex flex-col gap-3">
        <span className="section-title">{t("create.photos")}</span>
        <div className="grid grid-cols-4 gap-2">
          {photos.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl">
              <img src={url} className="h-full w-full object-cover" />
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
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-divider text-hint">
              <Camera className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px]">{uploading ? "..." : t("create.addPhoto")}</span>
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
        <div className="text-sm text-destructive">{formError || submitError}</div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? t("sending") : submitLabel}
      </button>
    </form>
  );
}
