import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlignLeft, Banknote, MapPin, Phone as PhoneIcon, Tag, Type } from "lucide-react";
import type { CreateRequestInput } from "@kerak/shared";
import { fetchCategories } from "../api/categories";
import { CategoryPicker } from "./CategoryPicker";
import { RegionDistrictPicker, type PlaceValue } from "./RegionDistrictPicker";
import { PhoneInput, phoneToDigits } from "./PhoneInput";
import { PriceInput } from "./PriceInput";
import { useTranslation } from "../i18n/LanguageContext";

export interface RequestFormInitialValues {
  categoryId: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  phone: string;
  addressText?: string | null;
}

interface RequestFormProps {
  initial?: RequestFormInitialValues;
  onSubmit: (payload: CreateRequestInput) => void;
  isSubmitting: boolean;
  submitLabel: string;
  submitError?: string | null;
}

function SectionHeader({ icon: Icon, title, hint }: { icon: typeof Tag; title: string; hint?: string }) {
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

export function RequestForm({ initial, onSubmit, isSubmitting, submitLabel, submitError }: RequestFormProps) {
  const { t } = useTranslation();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [budgetMin, setBudgetMin] = useState(initial?.budgetMin != null ? String(initial.budgetMin) : "");
  const [budgetMax, setBudgetMax] = useState(initial?.budgetMax != null ? String(initial.budgetMax) : "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [place, setPlace] = useState<PlaceValue | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!categoryId) return setFormError(t("create.errCategory"));
    if (!phone) return setFormError(t("create.errPhone"));
    if (phoneToDigits(phone).length !== 9) return setFormError(t("create.errPhoneIncomplete"));

    onSubmit({
      categoryId,
      title,
      description,
      budgetMin: budgetMin ? Number(budgetMin) : null,
      budgetMax: budgetMax ? Number(budgetMax) : null,
      addressText: place?.addressText ?? null,
      regionId: place?.regionId ?? null,
      districtId: place?.districtId ?? null,
      phone,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="card flex flex-col gap-4">
        <SectionHeader icon={Type} title={t("request.titleLabel")} hint={`${title.length}/120`} />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 120))}
          className="input"
          placeholder={t("request.titlePlaceholder")}
        />

        <div className="h-px bg-divider" />

        <SectionHeader icon={AlignLeft} title={t("create.description")} hint={`${description.length}/2000`} />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
          className="input min-h-28 resize-none"
          placeholder={t("request.descriptionPlaceholder")}
        />
      </div>

      <div className="card flex flex-col gap-4">
        <SectionHeader icon={Tag} title={t("create.category")} />
        <CategoryPicker categories={categories ?? []} value={categoryId} onChange={setCategoryId} />
      </div>

      <div className="card flex flex-col gap-3">
        <SectionHeader icon={Banknote} title={t("request.budget")} />
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <PriceInput value={budgetMin} onChange={setBudgetMin} className="input pr-14" placeholder={t("request.budgetMin")} />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-hint">
              {t("som")}
            </span>
          </div>
          <div className="relative">
            <PriceInput value={budgetMax} onChange={setBudgetMax} className="input pr-14" placeholder={t("request.budgetMax")} />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-hint">
              {t("som")}
            </span>
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-3">
        <SectionHeader icon={MapPin} title={t("create.address")} />
        <RegionDistrictPicker onChange={setPlace} initialAddressText={initial?.addressText} />
      </div>

      <div className="card flex flex-col gap-3">
        <SectionHeader icon={PhoneIcon} title={t("create.phone")} />
        <PhoneInput value={phone} onChange={setPhone} />
      </div>

      {(formError || submitError) && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{formError || submitError}</div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary py-3.5 text-base">
        {isSubmitting ? t("sending") : submitLabel}
      </button>
    </form>
  );
}
