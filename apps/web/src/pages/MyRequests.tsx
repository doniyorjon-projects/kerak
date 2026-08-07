import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MessageSquareText, Pencil, Trash2, XCircle } from "lucide-react";
import type { RequestDto } from "@kerak/shared";
import { deleteRequest, fetchMyRequests, updateRequest } from "../api/requests";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

function RequestRow({ request }: { request: RequestDto }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["requests", "mine"] });

  const statusMutation = useMutation({
    mutationFn: (status: "ACTIVE" | "CLOSED") => updateRequest(request.id, { status }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteRequest(request.id),
    onSuccess: invalidate,
  });

  const isClosed = request.status === "CLOSED";

  return (
    <div className="card flex flex-col gap-2.5">
      <Link to={`/requests/${request.id}`} className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-ink">{request.title}</span>
          <span className={`flex shrink-0 items-center gap-1 text-xs font-medium ${isClosed ? "text-hint" : "text-emerald-500"}`}>
            {isClosed ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {isClosed ? t("request.statusClosed") : t("request.statusActive")}
          </span>
        </div>
      </Link>
      <div className="grid grid-cols-3 gap-2">
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

export function MyRequests() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const { data: requests, isLoading } = useQuery({ queryKey: ["requests", "mine"], queryFn: fetchMyRequests });

  return (
    <div className="page">
      <PageHeader title={t("request.myTitle")} backTo="/profile" />

      {isLoading && <Spinner label={t("loading")} />}
      {requests?.length === 0 && <EmptyState icon={MessageSquareText} title={t("request.myEmpty")} />}

      <div className="flex flex-col gap-3">
        {requests?.map((request) => (
          <RequestRow key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
