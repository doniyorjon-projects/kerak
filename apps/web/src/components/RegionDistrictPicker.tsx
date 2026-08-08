import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { REGIONS } from "../data/uzbekistanRegions";
import { LocationMapPicker } from "./map/LocationMapPicker";
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
        </div>
      )}
    </div>
  );
}
