import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, User } from "lucide-react";
import { fetchMyBlocks, unblockUser } from "../api/blocks";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

export function BlockedUsers() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: blocks, isLoading } = useQuery({ queryKey: ["blocks", "mine"], queryFn: fetchMyBlocks });

  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blocks", "mine"] }),
  });

  return (
    <div className="page">
      <PageHeader title={t("blocked.title")} backTo="/profile" />

      {isLoading && <Spinner label={t("loading")} />}
      {blocks?.length === 0 && <EmptyState icon={Ban} title={t("blocked.empty")} />}

      <div className="flex flex-col gap-2">
        {blocks?.map((b) => (
          <div key={b.id} className="card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
                <User className="h-4 w-4 text-hint" />
              </div>
              <span className="text-sm font-medium text-ink">
                {b.blocked.username ? `@${b.blocked.username}` : b.blocked.firstName}
              </span>
            </div>
            <button
              onClick={() => unblockMutation.mutate(b.blocked.id)}
              disabled={unblockMutation.isPending}
              className="rounded-full bg-surface-secondary px-3 py-1.5 text-xs font-semibold text-ink transition active:scale-[0.98] disabled:opacity-50"
            >
              {t("listing.unblockUser")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
