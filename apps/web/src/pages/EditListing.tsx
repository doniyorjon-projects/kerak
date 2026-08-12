import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListingDto } from "@kerak/shared";
import { fetchListing, updateListing } from "../api/listings";
import { ListingForm } from "../components/ListingForm";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

export function EditListing() {
  const { listingId } = useParams<{ listingId: string }>();
  useBackButton("/my-listings");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const cachedMine = queryClient.getQueryData<ListingDto[]>(["listings", "mine"]);
  const stateListing = (location.state as { listing?: ListingDto } | null)?.listing;
  const cachedListing = stateListing ?? cachedMine?.find((l) => l.id === listingId);

  const { data: fetchedListing, isLoading } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => fetchListing(listingId!),
    enabled: !cachedListing && Boolean(listingId),
  });

  const listing = cachedListing ?? fetchedListing;

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateListing>[1]) => updateListing(listingId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      await queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
      navigate("/my-listings", { replace: true });
    },
  });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (!listing) return <div className="p-4 text-center text-destructive">{t("listing.notFound")}</div>;

  return (
    <div className="page">
      <PageHeader title={t("edit.title")} subtitle={t("edit.subtitle")} backTo="/my-listings" />
      <ListingForm
        initial={{
          categoryId: listing.categoryId,
          title: listing.title,
          description: listing.description,
          brand: listing.brand,
          attributes: listing.attributes,
          price: listing.price,
          priceUsd: listing.priceUsd,
          isNegotiable: listing.isNegotiable,
          isFree: listing.isFree,
          isUrgent: listing.isUrgent,
          hasDelivery: listing.hasDelivery,
          isBargainable: listing.isBargainable,
          sellerType: listing.sellerType,
          contactTelegram: listing.contactTelegram,
          phone: listing.phone,
          contactName: listing.contactName,
          photos: listing.photos,
          addressText: listing.addressText,
          condition: listing.condition,
        }}
        onSubmit={(payload) => updateMutation.mutate(payload)}
        isSubmitting={updateMutation.isPending}
        submitLabel={t("edit.submit")}
        submitError={updateMutation.error?.message}
      />
    </div>
  );
}
