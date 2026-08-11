import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MessageSquareText, Plus } from "lucide-react";
import { fetchRequestFeed } from "../api/requests";
import { fetchCategories } from "../api/categories";
import { REGIONS } from "../data/uzbekistanRegions";
import { RequestCard } from "../components/RequestCard";
import { CategoryPicker } from "../components/CategoryPicker";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

export function Requests() {
  useBackButton("/");
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState("");
  const [regionId, setRegionId] = useState("");

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["requests", categoryId, regionId],
    queryFn: () =>
      fetchRequestFeed({
        categoryId: categoryId || undefined,
        regionId: regionId ? Number(regionId) : undefined,
      }),
  });

  return (
    <div className="page">
      <PageHeader title={t("request.pageTitle")} subtitle={t("request.pageSubtitle")} backTo="/" />

      <Link to="/requests/new" className="btn-primary">
        <Plus className="h-4 w-4" />
        {t("request.add")}
      </Link>

      <div className="flex flex-col gap-2">
        <CategoryPicker categories={categories ?? []} value={categoryId} onChange={setCategoryId} allowClear />
        <div className="relative">
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="input appearance-none pr-9"
          >
            <option value="">{t("filters.allRegions")}</option>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nameUz}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
        </div>
      </div>

      {isLoading && <Spinner label={t("loading")} />}
      {error && <div className="text-center text-destructive">{t("home.loadError")}</div>}
      {requests?.length === 0 && (
        <EmptyState icon={MessageSquareText} title={t("request.empty")} description={t("request.emptyHint")} />
      )}

      <div className="flex flex-col gap-2.5">
        {requests?.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
