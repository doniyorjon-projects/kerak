import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createListing } from "../api/listings";
import { ListingForm } from "../components/ListingForm";
import { PageHeader } from "../components/PageHeader";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

export function CreateListing() {
  useBackButton("/");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createListing,
    onSuccess: async (listing) => {
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      navigate(`/listings/${listing.id}`, { replace: true });
    },
  });

  const isLimitError = createMutation.error?.message.includes("tarifni oshiring");

  return (
    <div className="page">
      <PageHeader title={t("create.title")} subtitle={t("create.subtitle")} backTo="/" />
      <ListingForm
        onSubmit={(payload) => createMutation.mutate(payload)}
        isSubmitting={createMutation.isPending}
        submitLabel={t("create.submit")}
        submitError={createMutation.error?.message}
      />
      {isLimitError && (
        <Link to="/plans" className="btn-secondary">
          {t("create.viewPlans")}
        </Link>
      )}
    </div>
  );
}
