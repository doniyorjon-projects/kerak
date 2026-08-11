import { useState } from "react";
import { ChevronLeft, ChevronRight, Folder, X } from "lucide-react";
import type { CategoryDto } from "@kerak/shared";
import { useTranslation } from "../i18n/LanguageContext";

interface CategoryPickerProps {
  categories: CategoryDto[];
  value: string;
  onChange: (categoryId: string) => void;
  /** Tanlovni "hammasi" holatiga qaytarish tugmasini ko'rsatadi - filtrlarda foydali. */
  allowClear?: boolean;
}

/**
 * Avval bo'lim (masalan "Transport"), keyin o'sha bo'limning ichidagi
 * toifalarini tanlash - bitta uzun ro'yxat o'rniga. Transport tanlansa
 * faqat transportga oid toifalar ko'rinadi, orqaga tugma bilan qaytish
 * mumkin.
 */
export function CategoryPicker({ categories, value, onChange, allowClear }: CategoryPickerProps) {
  const { t } = useTranslation();
  const roots = categories.filter((c) => !c.parentId);
  const selected = categories.find((c) => c.id === value) ?? null;
  const selectedRoot = selected ? categories.find((c) => c.id === selected.parentId) : null;

  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const activeRoot = activeRootId ? categories.find((c) => c.id === activeRootId) : null;
  const children = activeRoot ? categories.filter((c) => c.parentId === activeRoot.id) : [];

  if (selected && !activeRoot) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveRootId(selectedRoot?.id ?? null)}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-divider bg-surface-secondary px-3.5 py-2.5 text-left transition active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg">
            {selected.icon ?? <Folder className="h-4 w-4 text-brand" />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs text-hint">{selectedRoot?.nameUz}</span>
            <span className="truncate text-sm font-semibold text-ink">{selected.nameUz}</span>
          </span>
          <span className="shrink-0 text-xs font-semibold text-brand">{t("create.changeCategory")}</span>
        </button>
        {allowClear && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={t("filters.allCategories")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-divider bg-surface text-hint transition active:scale-[0.98]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  if (activeRoot) {
    return (
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setActiveRootId(null)}
          className="flex w-fit items-center gap-1 text-xs font-semibold text-brand"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {t("create.backToCategories")}
        </button>
        <div className="grid grid-cols-2 gap-2">
          {children.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setActiveRootId(null);
              }}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
                c.id === value ? "border-brand bg-brand/5" : "border-divider bg-surface"
              }`}
            >
              <span className="shrink-0 text-lg">{c.icon ?? <Folder className="h-4 w-4 text-hint" />}</span>
              <span className="truncate text-sm font-medium text-ink">{c.nameUz}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {roots.map((root) => (
        <button
          key={root.id}
          type="button"
          onClick={() => setActiveRootId(root.id)}
          className="flex items-center justify-between gap-2 rounded-xl border border-divider bg-surface px-3 py-2.5 text-left transition active:scale-[0.98]"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-lg">{root.icon ?? <Folder className="h-4 w-4 text-hint" />}</span>
            <span className="truncate text-sm font-medium text-ink">{root.nameUz}</span>
          </span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-hint" />
        </button>
      ))}
    </div>
  );
}
