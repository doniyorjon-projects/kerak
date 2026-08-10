import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  CheckSquare,
  Clock,
  ListChecks,
  Megaphone,
  PauseCircle,
  Pencil,
  PlayCircle,
  Rocket,
  Square,
  Tag,
  Trash2,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { bumpListing, deleteListing, fetchMyListings, updateListingStatus } from "../api/listings";
import { ListingStatus } from "@kerak/shared";
import type { ListingDto } from "@kerak/shared";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { showAlert } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

const STATUS_INFO: Record<ListingStatus, { labelKey: TranslationKey; icon: LucideIcon; className: string }> = {
  PENDING: { labelKey: "status.pending", icon: Clock, className: "text-promo" },
  ACTIVE: { labelKey: "status.active", icon: CheckCircle2, className: "text-success" },
  PAUSED: { labelKey: "status.paused", icon: PauseCircle, className: "text-hint" },
  SOLD: { labelKey: "status.sold", icon: Tag, className: "text-link" },
  REJECTED: { labelKey: "status.rejected", icon: XCircle, className: "text-destructive" },
};

interface ListingRowProps {
  listing: ListingDto;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

function ListingRow({ listing, selectMode, selected, onToggleSelect }: ListingRowProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["listings", "mine"] });

  const statusMutation = useMutation({
    mutationFn: (status: "ACTIVE" | "PAUSED" | "SOLD") => updateListingStatus(listing.id, status),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteListing(listing.id),
    onSuccess: invalidate,
  });
  const bumpMutation = useMutation({
    mutationFn: () => bumpListing(listing.id),
    onSuccess: () => {
      invalidate();
      showAlert(t("listing.bumped"));
    },
  });

  const { labelKey, icon: StatusIcon, className } = STATUS_INFO[listing.status];
  const isBoosted = Boolean(listing.boostedUntil && new Date(listing.boostedUntil) > new Date());

  return (
    <div className="card flex flex-col gap-2.5">
      <div className="flex items-start gap-2.5">
        {selectMode && (
          <button
            type="button"
            onClick={() => onToggleSelect(listing.id)}
            className="mt-0.5 shrink-0 text-brand"
            aria-label={t("myListings.select")}
          >
            {selected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-hint" />}
          </button>
        )}
        {selectMode ? (
          <div className="flex flex-1 flex-col gap-2.5" onClick={() => onToggleSelect(listing.id)}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-ink">{listing.title}</span>
              <span className={`flex shrink-0 items-center gap-1 text-xs font-medium ${className}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {t(labelKey)}
              </span>
            </div>
          </div>
        ) : (
          <Link to={`/listings/${listing.id}`} className="flex flex-1 flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-ink">{listing.title}</span>
              <span className={`flex shrink-0 items-center gap-1 text-xs font-medium ${className}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {t(labelKey)}
              </span>
            </div>
            {isBoosted && (
              <span className="flex items-center gap-1 text-xs font-medium text-promo">
                <Rocket className="h-3.5 w-3.5" />
                {t("myListings.boostedUntil")} {new Date(listing.boostedUntil!).toLocaleDateString("uz-UZ")}{" "}
                {t("myListings.until")}
              </span>
            )}
          </Link>
        )}
      </div>

      {!selectMode && (
        <>
          {listing.status === "ACTIVE" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => bumpMutation.mutate()}
                disabled={bumpMutation.isPending}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-brand/10 py-2.5 text-xs font-semibold text-brand transition active:scale-[0.98] disabled:opacity-50"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {t("listing.bump")}
              </button>
              <Link
                to={`/listings/${listing.id}/advertise`}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-promo/10 py-2.5 text-xs font-semibold text-promo transition active:scale-[0.98]"
              >
                <Megaphone className="h-3.5 w-3.5" />
                {t("advertise.button")}
              </Link>
            </div>
          )}
          {bumpMutation.isError && (
            <span className="text-xs text-destructive">{bumpMutation.error.message}</span>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/listings/${listing.id}/edit`}
              state={{ listing }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-brand/10 py-2.5 text-xs font-semibold text-brand transition active:scale-[0.98]"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("myListings.edit")}
            </Link>
            {listing.status !== "REJECTED" && listing.status !== "PENDING" && (
              <>
                {listing.status !== "ACTIVE" && (
                  <button
                    onClick={() => statusMutation.mutate("ACTIVE")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-success/10 py-2.5 text-xs font-semibold text-success transition active:scale-[0.98]"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    {t("myListings.activate")}
                  </button>
                )}
                {listing.status === "ACTIVE" && (
                  <button
                    onClick={() => statusMutation.mutate("PAUSED")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-hint transition active:scale-[0.98]"
                  >
                    <PauseCircle className="h-3.5 w-3.5" />
                    {t("myListings.pause")}
                  </button>
                )}
                {listing.status !== "SOLD" && (
                  <button
                    onClick={() => statusMutation.mutate("SOLD")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-hint transition active:scale-[0.98]"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {t("myListings.markSold")}
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => deleteMutation.mutate()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition active:scale-[0.98]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("delete")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const STATUS_TABS: { status: ListingStatus | "ALL"; labelKey: TranslationKey }[] = [
  { status: "ALL", labelKey: "myListings.filterAll" },
  { status: ListingStatus.ACTIVE, labelKey: "status.active" },
  { status: ListingStatus.PENDING, labelKey: "status.pending" },
  { status: ListingStatus.REJECTED, labelKey: "status.rejected" },
  { status: ListingStatus.PAUSED, labelKey: "status.paused" },
  { status: ListingStatus.SOLD, labelKey: "status.sold" },
];

export function MyListings() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "ALL">("ALL");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings", "mine"],
    queryFn: fetchMyListings,
  });

  const filtered = (listings ?? []).filter((l) => statusFilter === "ALL" || l.status === statusFilter);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["listings", "mine"] });
    setSelectedIds(new Set());
  };

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: "ACTIVE" | "PAUSED" | "SOLD" }) => {
      await Promise.all(ids.map((id) => updateListingStatus(id, status)));
    },
    onSuccess: invalidate,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteListing(id)));
    },
    onSuccess: invalidate,
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const selectedCount = selectedIds.size;
  const isBulkPending = bulkStatusMutation.isPending || bulkDeleteMutation.isPending;

  return (
    <div className="page">
      <div className="flex items-center justify-between gap-2">
        <PageHeader title={t("myListings.title")} backTo="/profile" />
        {filtered.length > 0 && (
          <button
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-secondary px-3 py-2 text-xs font-semibold text-ink transition active:scale-[0.98]"
          >
            {selectMode ? <X className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
            {selectMode ? t("cancel") : t("myListings.selectMode")}
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex w-fit gap-1 rounded-full border border-divider bg-surface p-1 shadow-soft">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.status}
              onClick={() => setStatusFilter(tab.status)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${statusFilter === tab.status ? "bg-brand text-brand-contrast" : "text-hint"}`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {selectMode && selectedCount > 0 && (
        <div className="card flex flex-col gap-2">
          <span className="text-xs text-hint">{t("myListings.selectedCount").replace("{count}", String(selectedCount))}</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => bulkStatusMutation.mutate({ ids: [...selectedIds], status: "ACTIVE" })}
              disabled={isBulkPending}
              className="flex items-center justify-center gap-1 rounded-xl bg-success/10 py-2.5 text-xs font-semibold text-success transition active:scale-[0.98] disabled:opacity-50"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              {t("myListings.activate")}
            </button>
            <button
              onClick={() => bulkStatusMutation.mutate({ ids: [...selectedIds], status: "PAUSED" })}
              disabled={isBulkPending}
              className="flex items-center justify-center gap-1 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-hint transition active:scale-[0.98] disabled:opacity-50"
            >
              <PauseCircle className="h-3.5 w-3.5" />
              {t("myListings.pause")}
            </button>
            <button
              onClick={() => bulkDeleteMutation.mutate([...selectedIds])}
              disabled={isBulkPending}
              className="flex items-center justify-center gap-1 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition active:scale-[0.98] disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("delete")}
            </button>
          </div>
        </div>
      )}

      {isLoading && <Spinner label={t("loading")} />}
      {filtered.length === 0 && (
        <EmptyState icon={ListChecks} title={t("myListings.empty")} />
      )}
      <div className="flex flex-col gap-3">
        {filtered.map((listing) => (
          <ListingRow
            key={listing.id}
            listing={listing}
            selectMode={selectMode}
            selected={selectedIds.has(listing.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>
    </div>
  );
}
