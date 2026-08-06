import { Link } from "react-router-dom";
import { Folder } from "lucide-react";
import type { CategoryDto } from "@kerak/shared";

export function CategoryCard({ category }: { category: CategoryDto }) {
  return (
    <Link
      to={`/categories/${category.id}`}
      className="card flex flex-col items-center justify-center gap-2 py-5 text-center transition active:scale-[0.96]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-secondary text-xl">
        {category.icon ?? <Folder className="h-5 w-5 text-hint" strokeWidth={1.5} />}
      </span>
      <span className="text-xs font-medium leading-tight text-ink">{category.nameUz}</span>
    </Link>
  );
}
