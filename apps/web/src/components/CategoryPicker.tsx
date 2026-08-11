import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
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
 * Kategoriya bolasi bo'lmaguncha ("leaf"gacha) bosqichma-bosqich pastga
 * tushadigan tanlagich. Daraxt 3 darajali (asosiy -> subkategoriya -> aniq
 * toifa) bo'lsa-da, ba'zi subkategoriyalarning o'zi bevosita tanlanadigan
 * ("leaf"), shuning uchun qattiq 3 daraja emas - "bola bo'lmaguncha" mantig'i
 * ishlatiladi. Faqat asosiy (1-daraja) kategoriyalarda ikonka ko'rsatiladi.
 */
export function CategoryPicker({ categories, value, onChange, allowClear }: CategoryPickerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [stack, setStack] = useState<string[]>([]);

  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const childrenOf = useMemo(() => {
    const map = new Map<string, CategoryDto[]>();
    for (const c of categories) {
      const key = c.parentId ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [categories]);

  const pathOf = (id: string): CategoryDto[] => {
    const path: CategoryDto[] = [];
    let current = byId.get(id);
    while (current) {
      path.unshift(current);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return path;
  };

  const selected = value ? byId.get(value) : undefined;
  const activeParentId = stack[stack.length - 1];
  const activeParent = activeParentId ? byId.get(activeParentId) : undefined;
  const currentLevel = childrenOf.get(activeParentId ?? "") ?? [];

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return categories
      .filter((c) => (childrenOf.get(c.id) ?? []).length === 0 && c.nameUz.toLowerCase().includes(q))
      .slice(0, 40)
      .map((c) => ({ category: c, path: pathOf(c.id) }));
  }, [search, categories, childrenOf]);

  if (selected && stack.length === 0 && !search) {
    const path = pathOf(selected.id);
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setStack(path.slice(0, -1).map((c) => c.id))}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-divider bg-surface-secondary px-3.5 py-2.5 text-left transition active:scale-[0.98]"
        >
          {path[0]?.icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg">
              {path[0].icon}
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            {path.length > 1 && (
              <span className="truncate text-xs text-hint">{path.slice(0, -1).map((c) => c.nameUz).join(" › ")}</span>
            )}
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

  const handlePick = (c: CategoryDto) => {
    const kids = childrenOf.get(c.id) ?? [];
    if (kids.length === 0) {
      onChange(c.id);
      setStack([]);
      setSearch("");
    } else {
      setStack((prev) => [...prev, c.id]);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setStack([]);
          }}
          placeholder={t("create.searchCategory")}
          className="input pl-10"
        />
      </div>

      {searchResults ? (
        searchResults.length === 0 ? (
          <p className="py-4 text-center text-sm text-hint">{t("region.noResults")}</p>
        ) : (
          <div className="flex max-h-72 flex-col divide-y divide-divider overflow-y-auto">
            {searchResults.map(({ category, path }) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onChange(category.id);
                  setSearch("");
                  setStack([]);
                }}
                className="flex flex-col items-start gap-0.5 py-2.5 text-left active:opacity-70"
              >
                <span className="truncate text-sm font-medium text-ink">{category.nameUz}</span>
                {path.length > 1 && (
                  <span className="truncate text-xs text-hint">{path.slice(0, -1).map((c) => c.nameUz).join(" › ")}</span>
                )}
              </button>
            ))}
          </div>
        )
      ) : (
        <>
          {activeParent && (
            <button
              type="button"
              onClick={() => setStack((prev) => prev.slice(0, -1))}
              className="flex w-fit items-center gap-1 text-xs font-semibold text-brand"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {stack.length > 1 ? activeParent.nameUz : t("create.backToCategories")}
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {currentLevel.map((c) => {
              const kids = childrenOf.get(c.id) ?? [];
              const isRoot = c.level === 1;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handlePick(c)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
                    c.id === value ? "border-brand bg-brand/5" : "border-divider bg-surface"
                  }`}
                >
                  {isRoot && c.icon && <span className="shrink-0 text-lg">{c.icon}</span>}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{c.nameUz}</span>
                  {kids.length > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-hint" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
