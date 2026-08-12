import { useRef, useState, useLayoutEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Folder } from "lucide-react";
import type { CategoryDto } from "@kerak/shared";
import { useTranslation } from "../i18n/LanguageContext";
import { getCategoryName } from "../api/categories";

export function CategoryScroller({ categories }: { categories: CategoryDto[] }) {
  const { lang } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ widthPct: number; leftPct: number } | null>(null);

  const updateThumb = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth, scrollLeft } = el;
    if (scrollWidth <= clientWidth + 1) {
      setThumb(null);
      return;
    }
    const widthPct = Math.max((clientWidth / scrollWidth) * 100, 15);
    const maxLeftPct = 100 - widthPct;
    const leftPct = (scrollLeft / (scrollWidth - clientWidth)) * maxLeftPct;
    setThumb({ widthPct, leftPct });
  }, []);

  useLayoutEffect(() => {
    updateThumb();
  }, [categories, updateThumb]);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={scrollerRef}
        onScroll={updateThumb}
        className="no-scrollbar -mx-4 overflow-x-auto px-4"
      >
        <div className="grid grid-flow-col grid-rows-2 gap-3" style={{ gridAutoColumns: "5.25rem" }}>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="relative flex flex-col items-center gap-1.5 rounded-xl border border-divider bg-surface p-2.5 text-center shadow-soft transition active:scale-95"
            >
              {category.listingsCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-semibold text-brand-contrast">
                  {category.listingsCount}
                </span>
              )}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-base">
                {category.icon ?? <Folder className="h-4 w-4 text-hint" strokeWidth={1.5} />}
              </span>
              <span className="line-clamp-2 text-[11px] font-medium leading-tight text-ink">
                {getCategoryName(category, lang)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {thumb && (
        <div className="mx-auto h-1 w-24 overflow-hidden rounded-full bg-surface-secondary">
          <div
            className="h-full rounded-full bg-hint/70 transition-[left] duration-100"
            style={{ width: `${thumb.widthPct}%`, marginLeft: `${thumb.leftPct}%` }}
          />
        </div>
      )}
    </div>
  );
}
