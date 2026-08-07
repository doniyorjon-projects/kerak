import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RequestDto } from "@kerak/shared";
import { fetchRequest, updateRequest } from "../api/requests";
import { RequestForm } from "../components/RequestForm";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

export function EditRequest() {
  const { requestId } = useParams<{ requestId: string }>();
  useBackButton("/my-requests");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const stateRequest = (location.state as { request?: RequestDto } | null)?.request;

  const { data: fetchedRequest, isLoading } = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => fetchRequest(requestId!),
    enabled: !stateRequest && Boolean(requestId),
  });

  const request = stateRequest ?? fetchedRequest;

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateRequest>[1]) => updateRequest(requestId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      navigate("/my-requests", { replace: true });
    },
  });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (!request) return <div className="p-4 text-center text-destructive">{t("request.notFound")}</div>;

  return (
    <div className="page">
      <PageHeader title={t("request.editTitle")} backTo="/my-requests" />
      <RequestForm
        initial={{
          categoryId: request.categoryId,
          title: request.title,
          description: request.description,
          budgetMin: request.budgetMin,
          budgetMax: request.budgetMax,
          phone: request.phone,
          addressText: request.addressText,
        }}
        onSubmit={(payload) => updateMutation.mutate(payload)}
        isSubmitting={updateMutation.isPending}
        submitLabel={t("edit.submit")}
        submitError={updateMutation.error?.message}
      />
    </div>
  );
}
