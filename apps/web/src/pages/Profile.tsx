import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ListChecks, LocateFixed, MapPin, Phone, ShieldCheck } from "lucide-react";
import { fetchMe, updateLocation, updatePhone } from "../api/users";
import { PageHeader } from "../components/PageHeader";
import { Spinner } from "../components/Spinner";
import { useTranslation } from "../i18n/LanguageContext";

export function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const [phone, setPhone] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (me?.phone) setPhone(me.phone);
  }, [me?.phone]);

  const phoneMutation = useMutation({
    mutationFn: updatePhone,
    onSuccess: (updated) => queryClient.setQueryData(["me"], updated),
  });

  const locationMutation = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => updateLocation(lat, lng),
    onSuccess: (updated) => queryClient.setQueryData(["me"], updated),
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
        <button type="button" onClick={detectLocation} disabled={locating} className="btn-secondary">
          <LocateFixed className="h-4 w-4" />
          {locating ? t("profile.detecting") : t("profile.updateLocation")}
        </button>
        {locationError && <span className="text-xs text-destructive">{locationError}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <Link to="/my-listings" className="card flex items-center justify-between transition active:scale-[0.98]">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <ListChecks className="h-5 w-5 text-hint" />
            {t("profile.myListings")}
          </span>
          <ChevronRight className="h-4 w-4 text-hint" />
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
