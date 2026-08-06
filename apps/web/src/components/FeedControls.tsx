import { List, Map as MapIcon } from "lucide-react";
import type { FeedSort } from "@kerak/shared";
import { useTranslation } from "../i18n/LanguageContext";

const RADIUS_OPTIONS = [5, 10, 20, 50, 100];

interface FeedControlsProps {
  sort: FeedSort;
  onSortChange: (sort: FeedSort) => void;
  radiusKm: number;
  onRadiusChange: (radiusKm: number) => void;
  view: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
  hasLocation: boolean;
}

export function FeedControls({
  sort,
  onSortChange,
  radiusKm,
  onRadiusChange,
  view,
  onViewChange,
  hasLocation,
}: FeedControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded-full border border-divider bg-surface p-0.5 shadow-soft">
        <button
          type="button"
          onClick={() => onSortChange("distance")}
          className={`pill ${sort === "distance" ? "bg-brand text-brand-contrast" : "text-hint"}`}
        >
          {t("feed.nearest")}
        </button>
        <button
          type="button"
          onClick={() => onSortChange("newest")}
          className={`pill ${sort === "newest" ? "bg-brand text-brand-contrast" : "text-hint"}`}
        >
          {t("feed.newest")}
        </button>
      </div>

      {sort === "distance" && hasLocation && (
        <select
          value={radiusKm}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="rounded-full border border-divider bg-surface px-3 py-1.5 text-xs text-ink shadow-soft"
        >
          {RADIUS_OPTIONS.map((km) => (
            <option key={km} value={km}>
              {km} {t("feed.withinKm")}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={() => onViewChange(view === "list" ? "map" : "list")}
        className="pill ml-auto flex items-center gap-1 border border-divider bg-surface text-hint shadow-soft"
      >
        {view === "list" ? <MapIcon className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
        {view === "list" ? t("feed.map") : t("feed.list")}
      </button>
    </div>
  );
}
