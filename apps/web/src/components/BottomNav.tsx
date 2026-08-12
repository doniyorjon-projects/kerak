import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, Home, LayoutGrid, Plus, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";
import { useHideOnScroll } from "../hooks/useHideOnScroll";
import { fetchFavorites } from "../api/favorites";

const LEFT_TABS: { to: string; labelKey: TranslationKey; icon: LucideIcon; end?: boolean }[] = [
  { to: "/", labelKey: "nav.home", icon: Home, end: true },
  { to: "/categories", labelKey: "nav.categories", icon: LayoutGrid },
];

const RIGHT_TABS: { to: string; labelKey: TranslationKey; icon: LucideIcon }[] = [
  { to: "/favorites", labelKey: "nav.favorites", icon: Heart },
  { to: "/profile", labelKey: "nav.profile", icon: User },
];

function NavTab({
  to,
  labelKey,
  icon: Icon,
  end,
  badgeCount,
}: {
  to: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  end?: boolean;
  badgeCount?: number;
}) {
  const { t } = useTranslation();
  return (
    <NavLink key={to} to={to} end={end} className="flex flex-1 justify-center">
      {({ isActive }) => (
        <span
          className={`flex items-center justify-center gap-1.5 rounded-full px-3.5 py-3 transition-all duration-200 ${
            isActive ? "bg-brand text-brand-contrast" : "text-hint"
          }`}
        >
          <span className="relative flex shrink-0">
            <Icon className="h-[21px] w-[21px] shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
            {!!badgeCount && (
              <span
                className={`absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold ${
                  isActive ? "bg-brand-contrast text-brand" : "bg-brand text-brand-contrast"
                }`}
              >
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            )}
          </span>
          <span
            className={`overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-200 ${
              isActive ? "max-w-[80px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            {t(labelKey)}
          </span>
        </span>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  const hidden = useHideOnScroll();
  const { data: favorites } = useQuery({ queryKey: ["favorites"], queryFn: fetchFavorites });
  const favoritesCount = favorites?.length ?? 0;

  return (
    <nav
      className={`fixed inset-x-3 z-[60] mx-auto flex max-w-md items-center justify-between gap-0.5 rounded-full border border-divider bg-surface/90 p-2 shadow-float backdrop-blur-lg transition-transform duration-300 ${
        hidden ? "translate-y-40" : "translate-y-0"
      }`}
      style={{ bottom: "max(1.1rem, calc(env(safe-area-inset-bottom) + 0.6rem))" }}
    >
      {LEFT_TABS.map((tab) => (
        <NavTab key={tab.to} {...tab} />
      ))}

      <NavLink to="/create" className="flex flex-1 justify-center">
        {({ isActive }) => (
          <span
            className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-promo text-white shadow-float ring-4 ring-app transition-transform ${
              isActive ? "scale-105" : ""
            } active:scale-95`}
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </span>
        )}
      </NavLink>

      {RIGHT_TABS.map((tab) => (
        <NavTab key={tab.to} {...tab} badgeCount={tab.to === "/favorites" ? favoritesCount : undefined} />
      ))}
    </nav>
  );
}
