import { Link } from "react-router-dom";
import { Folder } from "lucide-react";
import type { CategoryDto } from "@kerak/shared";
import { useTranslation } from "../i18n/LanguageContext";
import { getCategoryName } from "../api/categories";

export function CategoryCard({ category }: { category: CategoryDto }) {
  const { lang } = useTranslation();
  return (
    <Link
      to={`/categories/${category.id}`}
      className="card relative flex flex-col items-center justify-center gap-2 py-5 text-center transition active:scale-[0.96]"
    >
      {category.listingsCount > 0 && (
        <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-contrast">
          {category.listingsCount}
        </span>
      )}
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-secondary text-xl">
        {category.icon ?? <Folder className="h-5 w-5 text-hint" strokeWidth={1.5} />}
      </span>
      <span className="text-xs font-medium leading-tight text-ink">{getCategoryName(category, lang)}</span>
    </Link>
  );
}
