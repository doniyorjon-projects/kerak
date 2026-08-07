import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRequest } from "../api/requests";
import { RequestForm } from "../components/RequestForm";
import { PageHeader } from "../components/PageHeader";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

export function CreateRequest() {
  useBackButton("/requests");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createRequest,
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      navigate(`/requests/${request.id}`, { replace: true });
    },
  });

  return (
    <div className="page">
      <PageHeader title={t("request.newTitle")} subtitle={t("request.newSubtitle")} backTo="/requests" />
      <RequestForm
        onSubmit={(payload) => createMutation.mutate(payload)}
        isSubmitting={createMutation.isPending}
        submitLabel={t("request.submit")}
        submitError={createMutation.error?.message}
      />
    </div>
  );
}
