import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Trash2 } from "lucide-react";
import { deleteSavedSearch, fetchMySavedSearches } from "../api/savedSearches";
import { REGIONS } from "../data/uzbekistanRegions";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

export function SavedSearches() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: searches, isLoading } = useQuery({
    queryKey: ["saved-searches"],
    queryFn: fetchMySavedSearches,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSavedSearch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-searches"] }),
  });

  return (
    <div className="page">
      <PageHeader title={t("savedSearch.title")} subtitle={t("savedSearch.subtitle")} backTo="/profile" />

      {isLoading && <Spinner label={t("loading")} />}
      {searches?.length === 0 && <EmptyState icon={BellRing} title={t("savedSearch.empty")} />}

      <div className="flex flex-col gap-2">
        {searches?.map((s) => {
          const region = s.regionId ? REGIONS.find((r) => r.id === s.regionId) : null;
          const parts = [
            s.q,
            region?.nameUz,
            s.minPrice || s.maxPrice
              ? `${s.minPrice?.toLocaleString("uz-UZ") ?? "0"} – ${s.maxPrice?.toLocaleString("uz-UZ") ?? "?"}`
              : null,
          ].filter(Boolean);

          return (
            <div key={s.id} className="card flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-ink">{s.label}</span>
                {parts.length > 0 && <span className="text-xs text-hint">{parts.join(" · ")}</span>}
              </div>
              <button
                onClick={() => deleteMutation.mutate(s.id)}
                disabled={deleteMutation.isPending}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive transition active:scale-[0.98] disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
