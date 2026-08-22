import { Link } from "react-router-dom";
import { Eye, MapPin, Wallet } from "lucide-react";
import type { RequestDto } from "@kerak/shared";
import { REGIONS } from "../data/uzbekistanRegions";
import { useTranslation } from "../i18n/LanguageContext";

function getDistrictName(regionId: number | null, districtId: number | null): string | null {
  if (regionId == null) return null;
  const region = REGIONS.find((r) => r.id === regionId);
  if (districtId == null) return region?.nameUz ?? null;
  return region?.districts.find((d) => d.id === districtId)?.nameUz ?? region?.nameUz ?? null;
}

export function RequestCard({ request }: { request: RequestDto }) {
  const { t } = useTranslation();
  const districtName = getDistrictName(request.regionId, request.districtId);

  const budgetText =
    request.budgetMin != null || request.budgetMax != null
      ? [
          request.budgetMin != null ? request.budgetMin.toLocaleString("uz-UZ") : "0",
          request.budgetMax != null ? request.budgetMax.toLocaleString("uz-UZ") : null,
        ]
          .filter(Boolean)
          .join(" – ") + ` ${t("som")}`
      : null;

  return (
    <Link
      to={`/requests/${request.id}`}
      className="card flex flex-col gap-2 transition active:scale-[0.98]"
    >
      <span className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{request.title}</span>
      <span className="line-clamp-2 text-xs leading-relaxed text-hint">{request.description}</span>
      <div className="flex items-center justify-between gap-2 pt-1">
        {budgetText ? (
          <span className="flex min-w-0 items-center gap-1 text-xs font-medium text-brand">
            <Wallet className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{budgetText}</span>
          </span>
        ) : (
          <span className="text-xs text-hint">{t("request.anyBudget")}</span>
        )}
        <span className="flex shrink-0 items-center gap-2 text-xs text-hint">
          {districtName && (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{districtName}</span>
            </span>
          )}
          <span className="flex shrink-0 items-center gap-1">
            <Eye className="h-3 w-3" />
            {request.viewsCount}
          </span>
        </span>
      </div>
    </Link>
  );
}
