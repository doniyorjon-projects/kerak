import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  ListChecks,
  LocateFixed,
  Map,
  MapPin,
  MapPinned,
  Phone,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { UNLIMITED_LISTINGS } from "@kerak/shared";
import { fetchMe, updateLocation, updatePhone } from "../api/users";
import { reverseGeocode } from "../api/geo";
import { LocationMapPicker } from "../components/map/LocationMapPicker";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { useTranslation } from "../i18n/LanguageContext";

const TASHKENT_CENTER = { lat: 41.311081, lng: 69.240562 };

function formatPlace(result: { place: string | null; district: string | null; region: string | null; displayName: string | null }): string | null {
  const parts = [result.place, result.district, result.region].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return result.displayName;
}

export function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const [phone, setPhone] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (me?.phone) setPhone(me.phone);
  }, [me?.phone]);

  const phoneMutation = useMutation({
    mutationFn: updatePhone,
    onSuccess: (updated) => queryClient.setQueryData(["me"], updated),
  });

  const locationMutation = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => updateLocation(lat, lng),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      setPendingPosition(null);
      setShowMapPicker(false);
    },
  });

  const { data: savedPlace } = useQuery({
    queryKey: ["reverse-geocode", "saved", me?.lat, me?.lng],
    queryFn: () => reverseGeocode(me!.lat!, me!.lng!),
    enabled: me?.lat != null && me?.lng != null,
  });

  const { data: pendingPlace, isFetching: isFetchingPendingPlace } = useQuery({
    queryKey: ["reverse-geocode", "pending", pendingPosition?.lat, pendingPosition?.lng],
    queryFn: () => reverseGeocode(pendingPosition!.lat, pendingPosition!.lng),
    enabled: pendingPosition != null,
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t("profile.geoUnsupported"));
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationMutation.mutate({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError(t("profile.geoFailed"));
        setLocating(false);
      },
    );
  };

  if (isLoading) return <Spinner label={t("loading")} />;
  if (!me) return <div className="p-4 text-center text-destructive">{t("profile.loadError")}</div>;

  return (
    <div className="page">
      <PageHeader title={t("profile.title")} />

      <div className="card flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-brand-contrast">
          {me.firstName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-ink">{me.firstName}</span>
          {me.username && <span className="text-sm text-hint">@{me.username}</span>}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          phoneMutation.mutate(phone);
        }}
        className="card flex flex-col gap-3"
      >
        <label className="label">
          <span className="flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-hint" />
            {t("profile.phone")}
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998901234567"
            className="input"
          />
        </label>
        <button type="submit" disabled={phoneMutation.isPending} className="btn-primary">
          {phoneMutation.isPending ? t("saving") : t("save")}
        </button>
      </form>

      <div className="card flex flex-col gap-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <MapPin className="h-4 w-4 text-hint" />
          {t("profile.location")}
        </span>
        <span className="text-xs leading-relaxed text-hint">
          {me.lat != null && me.lng != null ? t("profile.locationSaved") : t("profile.locationNotSaved")}
        </span>
        {me.lat != null && me.lng != null && savedPlace && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-brand">
            <MapPinned className="h-3.5 w-3.5" />
            {t("profile.detectedNear")} {formatPlace(savedPlace)}
          </span>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={detectLocation} disabled={locating} className="btn-secondary flex-1">
            <LocateFixed className="h-4 w-4" />
            {locating ? t("profile.detecting") : t("profile.updateLocation")}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMapPicker((v) => !v);
              setPendingPosition(null);
            }}
            className="btn-secondary flex-1"
          >
            <Map className="h-4 w-4" />
            {t("profile.chooseOnMap")}
          </button>
        </div>
        {locationError && <span className="text-xs text-destructive">{locationError}</span>}
        {showMapPicker && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-hint">{t("profile.chooseOnMapHint")}</span>
            <LocationMapPicker
              lat={pendingPosition?.lat ?? me.lat ?? TASHKENT_CENTER.lat}
              lng={pendingPosition?.lng ?? me.lng ?? TASHKENT_CENTER.lng}
              onChange={setPendingPosition}
            />
            {pendingPosition && (
              <div className="flex flex-col gap-2 rounded-xl bg-surface-secondary p-3">
                <span className="text-xs text-ink">
                  {isFetchingPendingPlace
                    ? t("loading")
                    : pendingPlace
                      ? formatPlace(pendingPlace)
                      : null}
                </span>
                <button
                  type="button"
                  onClick={() => locationMutation.mutate(pendingPosition)}
                  disabled={locationMutation.isPending}
                  className="btn-primary"
                >
                  <Check className="h-4 w-4" />
                  {locationMutation.isPending ? t("saving") : t("profile.confirmLocation")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Link to="/my-listings" className="card flex items-center justify-between transition active:scale-[0.98]">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <ListChecks className="h-5 w-5 text-hint" />
            {t("profile.myListings")}
          </span>
          <ChevronRight className="h-4 w-4 text-hint" />
        </Link>

        <Link to="/plans" className="card flex items-center justify-between transition active:scale-[0.98]">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <Rocket className="h-5 w-5 text-hint" />
            {t("profile.plan")}
          </span>
          <span className="flex items-center gap-1 text-xs text-hint">
            {me.listingsLimit >= UNLIMITED_LISTINGS ? t("plans.featureUnlimitedListings") : me.listingsLimit}
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>

        {me.isAdmin && (
          <Link to="/admin" className="card flex items-center justify-between transition active:scale-[0.98]">
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <ShieldCheck className="h-5 w-5 text-hint" />
              {t("profile.adminPanel")}
            </span>
            <ChevronRight className="h-4 w-4 text-hint" />
          </Link>
        )}
      </div>
    </div>
  );
}
