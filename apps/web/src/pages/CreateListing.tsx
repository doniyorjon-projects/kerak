import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCircle2, Megaphone } from "lucide-react";
import type { ListingDto } from "@kerak/shared";
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
  const [createdListing, setCreatedListing] = useState<ListingDto | null>(null);

  const createMutation = useMutation({
    mutationFn: createListing,
    onSuccess: async (listing) => {
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      setCreatedListing(listing);
    },
  });

  const isLimitError = createMutation.error?.message.includes("tarifni oshiring");

  if (createdListing) {
    return (
      <div className="page">
        <PageHeader title={t("create.successTitle")} backTo="/" />

        <div className="card flex flex-col gap-3">
          <span className="flex items-center gap-2 text-base font-bold text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
            {t("create.successMessage")}
          </span>
        </div>

        <div className="card flex flex-col gap-3 border-amber-500/30 bg-amber-500/5">
          <span className="flex items-center gap-2 text-sm font-semibold text-amber-600">
            <Megaphone className="h-4 w-4" />
            {t("advertise.suggestTitle")}
          </span>
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs text-ink">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {t("advertise.suggestFeature1")}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {t("advertise.suggestFeature2")}
            </span>
          </div>
          <Link to={`/listings/${createdListing.id}/advertise`} className="btn-primary">
            <Megaphone className="h-4 w-4" />
            {t("advertise.button")}
          </Link>
        </div>

        <button
          onClick={() => navigate(`/listings/${createdListing.id}`, { replace: true })}
          className="btn-secondary"
        >
          {t("create.skipAdvertise")}
        </button>
      </div>
    );
  }

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
