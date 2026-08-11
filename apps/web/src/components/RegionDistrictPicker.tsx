import { useEffect, useState } from "react";
import { ChevronDown, LocateFixed } from "lucide-react";
import { REGIONS } from "../data/uzbekistanRegions";
import { LocationMapPicker } from "./map/LocationMapPicker";
import { findNearestPlace } from "../utils/nearestRegion";
import { useTranslation } from "../i18n/LanguageContext";

export interface PlaceValue {
  addressText: string;
  regionId: number;
  districtId: number | null;
  lat: number;
  lng: number;
}

interface RegionDistrictPickerProps {
  onChange: (value: PlaceValue | null) => void;
  initialAddressText?: string | null;
}

function matchAddressText(addressText: string): { regionId: number; districtId: number | "" } | null {
  for (const region of REGIONS) {
    if (addressText === region.nameUz) return { regionId: region.id, districtId: "" };
    const district = region.districts.find((d) => addressText === `${d.nameUz}, ${region.nameUz}`);
    if (district) return { regionId: region.id, districtId: district.id };
  }
  return null;
}

export function RegionDistrictPicker({ onChange, initialAddressText }: RegionDistrictPickerProps) {
  const { t } = useTranslation();
  const [regionId, setRegionId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialAddressText) return;
    const match = matchAddressText(initialAddressText);
    if (!match) return;
    setRegionId(match.regionId);
    setDistrictId(match.districtId);

    const matchedRegion = REGIONS.find((r) => r.id === match.regionId);
    if (matchedRegion) {
      const matchedDistrict = matchedRegion.districts.find((d) => d.id === match.districtId);
      const coords = matchedDistrict ?? matchedRegion;
      setPin({ lat: coords.lat, lng: coords.lng });
      onChange({
        addressText: initialAddressText,
        regionId: matchedRegion.id,
        districtId: match.districtId || null,
        lat: coords.lat,
        lng: coords.lng,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const region = REGIONS.find((r) => r.id === regionId);

  const handleRegionChange = (raw: string) => {
    const id = raw ? Number(raw) : "";
    setRegionId(id);
    setDistrictId("");
    const newRegion = REGIONS.find((r) => r.id === id);
    if (newRegion) {
      setPin({ lat: newRegion.lat, lng: newRegion.lng });
      onChange({
        addressText: newRegion.nameUz,
        regionId: newRegion.id,
        districtId: null,
        lat: newRegion.lat,
        lng: newRegion.lng,
      });
    } else {
      setPin(null);
      onChange(null);
    }
  };

  const handleDistrictChange = (raw: string) => {
    const id = raw ? Number(raw) : "";
    setDistrictId(id);
    if (!region) return;
    const district = region.districts.find((d) => d.id === id);
    const coords = district ?? region;
    setPin({ lat: coords.lat, lng: coords.lng });
    onChange({
      addressText: district ? `${district.nameUz}, ${region.nameUz}` : region.nameUz,
      regionId: region.id,
      districtId: district ? district.id : null,
      lat: coords.lat,
      lng: coords.lng,
    });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(t("profile.geoUnsupported"));
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        setPin({ lat: latitude, lng: longitude });
        const place = findNearestPlace(latitude, longitude);
        if (place) {
          setRegionId(place.region.id);
          setDistrictId(place.district?.id ?? "");
          onChange({
            addressText: place.district ? `${place.district.nameUz}, ${place.region.nameUz}` : place.region.nameUz,
            regionId: place.region.id,
            districtId: place.district?.id ?? null,
            lat: latitude,
            lng: longitude,
          });
        } else if (region) {
          const existingDistrict = region.districts.find((d) => d.id === districtId);
          onChange({
            addressText: existingDistrict ? `${existingDistrict.nameUz}, ${region.nameUz}` : region.nameUz,
            regionId: region.id,
            districtId: existingDistrict ? existingDistrict.id : null,
            lat: latitude,
            lng: longitude,
          });
        }
      },
      () => {
        setLocating(false);
        setGeoError(t("profile.geoFailed"));
      },
    );
  };

  const handlePinChange = (position: { lat: number; lng: number }) => {
    if (!region) return;
    setPin(position);
    const district = region.districts.find((d) => d.id === districtId);
    onChange({
      addressText: district ? `${district.nameUz}, ${region.nameUz}` : region.nameUz,
      regionId: region.id,
      districtId: district ? district.id : null,
      lat: position.lat,
      lng: position.lng,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <select
          value={regionId}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="input appearance-none pr-9"
        >
          <option value="">{t("create.selectRegion")}</option>
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameUz}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
      </div>
      <div className="relative">
        <select
          value={districtId}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!region}
          className="input appearance-none pr-9 disabled:opacity-50"
        >
          <option value="">{t("create.selectDistrict")}</option>
          {region?.districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nameUz}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hint" />
      </div>
      {pin && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-hint">{t("create.fineTuneLocation")}</span>
          <LocationMapPicker lat={pin.lat} lng={pin.lng} onChange={handlePinChange} />
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-brand transition active:scale-[0.98] disabled:opacity-50"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            {locating ? t("profile.detecting") : t("region.enableGeo")}
          </button>
          {geoError && <span className="text-xs text-destructive">{geoError}</span>}
        </div>
      )}
    </div>
  );
}
