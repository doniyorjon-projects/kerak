import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Folder, PackageSearch } from "lucide-react";
import { fetchCategories } from "../api/categories";
import { CategoryCard } from "../components/CategoryCard";
import { SearchBar } from "../components/SearchBar";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useTranslation } from "../i18n/LanguageContext";

export function Categories() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const roots = useMemo(() => (categories ?? []).filter((c) => !c.parentId), [categories]);
  const activeRoot = roots.find((r) => r.id === activeRootId) ?? roots[0];
  const childrenOf = (parentId: string) => (categories ?? []).filter((c) => c.parentId === parentId);

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    return (categories ?? []).filter((c) => c.parentId && c.nameUz.toLowerCase().includes(q));
  }, [categories, search]);

  if (isLoading) return <Spinner label={t("loading")} />;
  if (error) return <div className="p-4 text-center text-destructive">{t("categories.loadError")}</div>;

  return (
    <div className="page">
      <PageHeader title={t("categories.title")} subtitle={t("categories.subtitle")} />
      <SearchBar onSearch={setSearch} />

      {searchResults ? (
        <div className="grid grid-cols-3 gap-3">
          {searchResults.length === 0 && (
            <div className="col-span-3">
              <EmptyState icon={PackageSearch} title={t("categories.searchEmpty")} />
            </div>
          )}
          {searchResults.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="-mx-4 flex gap-0">
          <div className="flex w-20 shrink-0 flex-col gap-1 border-r border-divider px-2">
            {roots.map((root) => {
              const isActive = root.id === activeRoot?.id;
              return (
                <button
                  key={root.id}
                  type="button"
                  onClick={() => setActiveRootId(root.id)}
                  className="flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center transition active:scale-95"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition ${
                      isActive ? "bg-brand text-brand-contrast" : "bg-surface-secondary"
                    }`}
                  >
                    {root.icon ?? <Folder className="h-4 w-4" />}
                  </span>
                  <span
                    className={`line-clamp-2 text-[10px] leading-tight transition ${
                      isActive ? "font-semibold text-brand" : "font-medium text-hint"
                    }`}
                  >
                    {root.nameUz}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 px-3">
            {activeRoot && (
              <>
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink">
                  <span>{activeRoot.icon}</span>
                  {activeRoot.nameUz}
                </h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {childrenOf(activeRoot.id).map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
