import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BoxSelect, CheckCheck, Clock, MessageCircle, Rocket, Star, ThumbsDown, ThumbsUp, TrendingDown } from "lucide-react";
import type { NotificationType } from "@kerak/shared";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notifications";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

const ICONS: Record<NotificationType, typeof Bell> = {
  LISTING_APPROVED: ThumbsUp,
  LISTING_REJECTED: ThumbsDown,
  BOOST_PAID: Rocket,
  PLAN_PAID: Rocket,
  NEW_MESSAGE: MessageCircle,
  REPORT_RESOLVED: BoxSelect,
  LISTING_EXPIRED: Clock,
  NEW_RATING: Star,
  PRICE_DROP: TrendingDown,
};

export function Notifications() {
  useBackButton("/");
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
  };

  const readMutation = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const readAllMutation = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });

  return (
    <div className="page">
      <div className="flex items-center justify-between">
        <PageHeader title={t("notifications.title")} backTo="/" />
        {notifications && notifications.length > 0 && (
          <button
            onClick={() => readAllMutation.mutate()}
            className="flex items-center gap-1 text-xs text-brand"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      {isLoading && <Spinner label={t("loading")} />}
      {notifications?.length === 0 && <EmptyState icon={Bell} title={t("notifications.empty")} />}

      <div className="flex flex-col gap-2">
        {notifications?.map((n) => {
          const Icon = ICONS[n.type] ?? Bell;
          const content = (
            <div
              className={`card flex gap-3 ${!n.isRead ? "border-brand/40" : ""}`}
              onClick={() => !n.isRead && readMutation.mutate(n.id)}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                <Icon className="h-4 w-4 text-hint" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{n.title}</span>
                  {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />}
                </div>
                <span className="text-sm text-hint">{n.body}</span>
                <span className="text-[11px] text-hint">
                  {new Date(n.createdAt).toLocaleString("uz-UZ")}
                </span>
              </div>
            </div>
          );
          return n.link ? (
            <Link key={n.id} to={n.link}>
              {content}
            </Link>
          ) : (
            <div key={n.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
