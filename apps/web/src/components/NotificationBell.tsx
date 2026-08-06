import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { fetchUnreadCount } from "../api/notifications";

export function NotificationBell() {
  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
  });

  const count = data?.count ?? 0;

  return (
    <Link
      to="/notifications"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-divider bg-surface shadow-soft"
    >
      <Bell className="h-5 w-5 text-ink" strokeWidth={1.75} />
      {count > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
