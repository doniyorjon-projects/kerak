import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { deleteRequest, fetchRequest, updateRequest } from "../api/requests";
import { fetchMe } from "../api/users";
import { blockUser, checkBlockStatus, unblockUser } from "../api/blocks";
import { fetchCategories } from "../api/categories";
import { REGIONS } from "../data/uzbekistanRegions";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { openTelegramLink } from "../telegram";
import { useTranslation } from "../i18n/LanguageContext";

function getDistrictName(regionId: number | null, districtId: number | null): string | null {
  if (regionId == null) return null;
  const region = REGIONS.find((r) => r.id === regionId);
  if (districtId == null) return region?.nameUz ?? null;
  return region?.districts.find((d) => d.id === districtId)?.nameUz ?? region?.nameUz ?? null;
}

export function RequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  useBackButton("/requests");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: request, isLoading, error } = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => fetchRequest(requestId!),
    enabled: Boolean(requestId),
  });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: blockStatus } = useQuery({
    queryKey: ["block-status", request?.author.id],
    queryFn: () => checkBlockStatus(request!.author.id),
    enabled: Boolean(request?.author.id && me && me.id !== request.author.id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: "ACTIVE" | "CLOSED") => updateRequest(requestId!, { status }),
    onSuccess: (updated) => queryClient.setQueryData(["request", requestId], updated),
  });

  const blockMutation = useMutation({
    mutationFn: () =>
      blockStatus?.isBlocked ? unblockUser(request!.author.id) : blockUser(request!.author.id),
    onSuccess: (result) => queryClient.setQueryData(["block-status", request?.author.id], result),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRequest(requestId!),
    onSuccess: () => navigate("/requests", { replace: true }),
  });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (error || !request) return <div className="p-4 text-center text-destructive">{t("request.notFound")}</div>;

  const isOwner = Boolean(me && me.id === request.author.id);
  const isAdminViewing = Boolean(me?.isAdmin && !isOwner);
  const isClosed = request.status === "CLOSED";
  const category = categories?.find((c) => c.id === request.categoryId);
  const districtName = getDistrictName(request.regionId, request.districtId);
  const budgetText =
    request.budgetMin != null || request.budgetMax != null
      ? [
          request.budgetMin != null ? request.budgetMin.toLocaleString("uz-UZ") : "0",
          request.budgetMax != null ? request.budgetMax.toLocaleString("uz-UZ") : null,
        ]
          .filter(Boolean)
          .join(" – ") + ` ${t("som")}`
      : t("request.anyBudget");

  return (
    <div className="page">
      <PageHeader title={t("request.detailTitle")} backTo="/requests" />

      <div className="card flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-lg font-bold leading-snug text-ink">{request.title}</h1>
          <span className={`flex shrink-0 items-center gap-1 text-xs font-medium ${isClosed ? "text-hint" : "text-emerald-500"}`}>
            {isClosed ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {isClosed ? t("request.statusClosed") : t("request.statusActive")}
          </span>
        </div>

        {category && (
          <span className="w-fit rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
            {category.icon} {category.nameUz}
          </span>
        )}

        <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{request.description}</p>

        <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-3 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-brand">
            <Wallet className="h-4 w-4" />
            {budgetText}
          </span>
          {districtName && (
            <span className="flex items-center gap-1.5 text-hint">
              <MapPin className="h-4 w-4" />
              {districtName}
            </span>
          )}
        </div>
      </div>

      <div className="card flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
            <User className="h-4 w-4 text-hint" />
          </div>
          <span className="text-sm font-medium text-ink">
            {request.author.username ? `@${request.author.username}` : request.author.firstName}
          </span>
        </div>
        {!isOwner && !isAdminViewing && (
          <button
            onClick={() => blockMutation.mutate()}
            disabled={blockMutation.isPending}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs active:bg-surface-secondary disabled:opacity-50 ${blockStatus?.isBlocked ? "text-destructive" : "text-hint"}`}
          >
            <Ban className="h-3.5 w-3.5" />
            {blockStatus?.isBlocked ? t("listing.unblockUser") : t("listing.blockUser")}
          </button>
        )}
      </div>

      {isOwner && (
        <div className="card flex flex-col gap-3">
          <span className="text-sm font-semibold text-ink">{t("request.manageTitle")}</span>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/requests/${request.id}/edit`}
              state={{ request }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-brand/10 py-2.5 text-xs font-semibold text-brand transition active:scale-[0.98]"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("myListings.edit")}
            </Link>
            <button
              onClick={() => statusMutation.mutate(isClosed ? "ACTIVE" : "CLOSED")}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-hint transition active:scale-[0.98]"
            >
              {isClosed ? t("request.reopen") : t("request.close")}
            </button>
            {deleteConfirm ? (
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-destructive py-2.5 text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("request.confirmDelete")}
              </button>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition active:scale-[0.98]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("delete")}
              </button>
            )}
          </div>
        </div>
      )}

      {!isOwner && (
        <div className="flex flex-col gap-2">
          {request.author.username && (
            <button
              type="button"
              onClick={() => openTelegramLink(`https://t.me/${request.author.username}`)}
              className="btn-primary"
            >
              <MessageCircle className="h-4 w-4" />
              {t("listing.contactTelegram")}
            </button>
          )}
          <a
            href={`tel:${request.phone}`}
            onClick={() => void navigator.clipboard?.writeText(request.phone)}
            className="btn-secondary"
          >
            <Phone className="h-4 w-4" />
            {t("listing.contactPhone")}: {request.phone}
          </a>

          {isAdminViewing && (
            <div className="card mt-1 flex flex-col gap-2">
              <span className="section-title">{t("listing.moderationTitle")}</span>
              {deleteConfirm ? (
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive py-2.5 text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("request.confirmDelete")}
                </button>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition active:scale-[0.98]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("delete")}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
