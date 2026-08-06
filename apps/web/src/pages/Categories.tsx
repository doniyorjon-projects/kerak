import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/categories";
import { CategoryCard } from "../components/CategoryCard";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { useTranslation } from "../i18n/LanguageContext";

export function Categories() {
  const { t } = useTranslation();
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (error) return <div className="p-4 text-center text-destructive">{t("categories.loadError")}</div>;

  const roots = (categories ?? []).filter((c) => !c.parentId);
  const childrenOf = (parentId: string) => (categories ?? []).filter((c) => c.parentId === parentId);

  return (
    <div className="page">
      <PageHeader title={t("categories.title")} subtitle={t("categories.subtitle")} />
      {roots.map((root) => (
        <section key={root.id} className="flex flex-col gap-3">
          <h2 className="section-title flex items-center gap-1.5">
            <span className="text-sm">{root.icon}</span>
            {root.nameUz}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {childrenOf(root.id).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
