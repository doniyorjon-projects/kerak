import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  ListChecks,
  Megaphone,
  PauseCircle,
  Pencil,
  PlayCircle,
  Rocket,
  Tag,
  Trash2,
  TrendingUp,
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
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

const STATUS_INFO: Record<ListingStatus, { labelKey: TranslationKey; icon: LucideIcon; className: string }> = {
  PENDING: { labelKey: "status.pending", icon: Clock, className: "text-amber-500" },
  ACTIVE: { labelKey: "status.active", icon: CheckCircle2, className: "text-emerald-500" },
  PAUSED: { labelKey: "status.paused", icon: PauseCircle, className: "text-hint" },
  SOLD: { labelKey: "status.sold", icon: Tag, className: "text-link" },
  REJECTED: { labelKey: "status.rejected", icon: XCircle, className: "text-destructive" },
};

function ListingRow({ listing }: { listing: ListingDto }) {
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
    onSuccess: invalidate,
  });

  const { labelKey, icon: StatusIcon, className } = STATUS_INFO[listing.status];
  const isBoosted = Boolean(listing.boostedUntil && new Date(listing.boostedUntil) > new Date());

  return (
    <div className="card flex flex-col gap-2.5">
      <Link to={`/listings/${listing.id}`} className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-ink">{listing.title}</span>
          <span className={`flex shrink-0 items-center gap-1 text-xs font-medium ${className}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {t(labelKey)}
          </span>
        </div>
        {isBoosted && (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
            <Rocket className="h-3.5 w-3.5" />
            {t("myListings.boostedUntil")} {new Date(listing.boostedUntil!).toLocaleDateString("uz-UZ")}{" "}
            {t("myListings.until")}
          </span>
        )}
      </Link>
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
            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-500 transition active:scale-[0.98]"
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
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-500 transition active:scale-[0.98]"
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
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "ALL">("ALL");
  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings", "mine"],
    queryFn: fetchMyListings,
  });

  const filtered = (listings ?? []).filter((l) => statusFilter === "ALL" || l.status === statusFilter);

  return (
    <div className="page">
      <PageHeader title={t("myListings.title")} backTo="/profile" />

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

      {isLoading && <Spinner label={t("loading")} />}
      {filtered.length === 0 && (
        <EmptyState icon={ListChecks} title={t("myListings.empty")} />
      )}
      <div className="flex flex-col gap-3">
        {filtered.map((listing) => (
          <ListingRow key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
