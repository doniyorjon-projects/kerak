import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MessageSquareText, Plus, X } from "lucide-react";
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

function CategoryFilterDropdown({
  categoryId,
  onChange,
}: {
  categoryId: string;
  onChange: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const selected = categories?.find((c) => c.id === categoryId);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="input flex items-center justify-between text-left"
      >
        <span className={`truncate ${selected ? "text-ink" : "text-hint"}`}>
          {selected ? `${selected.icon ?? ""} ${selected.nameUz}`.trim() : t("filters.allCategories")}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-hint" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50 motion-safe:animate-[backdrop-fade-in_0.2s_ease-out]" onClick={() => setOpen(false)} />
            <div className="relative z-10 flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-app motion-safe:animate-[sheet-slide-up_0.28s_cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex items-center justify-between px-4 pb-3 pt-4">
                <span className="w-8" />
                <h2 className="truncate text-base font-bold text-ink">{t("create.category")}</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("cancel")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"
                >
                  <X className="h-4 w-4 text-hint" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <CategoryPicker
                  categories={categories ?? []}
                  value={categoryId}
                  onChange={(id) => {
                    onChange(id);
                    setOpen(false);
                  }}
                  allowClear
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function Requests() {
  useBackButton("/");
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState("");
  const [regionId, setRegionId] = useState("");

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
        <CategoryFilterDropdown categoryId={categoryId} onChange={setCategoryId} />
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
