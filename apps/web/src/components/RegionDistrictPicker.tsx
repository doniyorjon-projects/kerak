import { useEffect, useState } from "react";
import { REGIONS } from "../data/uzbekistanRegions";
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

  useEffect(() => {
    if (!initialAddressText) return;
    const match = matchAddressText(initialAddressText);
    if (!match) return;
    setRegionId(match.regionId);
    setDistrictId(match.districtId);

    const matchedRegion = REGIONS.find((r) => r.id === match.regionId);
    if (matchedRegion) {
      onChange({
        addressText: initialAddressText,
        regionId: matchedRegion.id,
        districtId: match.districtId || null,
        lat: matchedRegion.lat,
        lng: matchedRegion.lng,
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
    onChange(
      newRegion
        ? { addressText: newRegion.nameUz, regionId: newRegion.id, districtId: null, lat: newRegion.lat, lng: newRegion.lng }
        : null,
    );
  };

  const handleDistrictChange = (raw: string) => {
    const id = raw ? Number(raw) : "";
    setDistrictId(id);
    if (!region) return;
    const district = region.districts.find((d) => d.id === id);
    onChange({
      addressText: district ? `${district.nameUz}, ${region.nameUz}` : region.nameUz,
      regionId: region.id,
      districtId: district ? district.id : null,
      lat: region.lat,
      lng: region.lng,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        value={regionId}
        onChange={(e) => handleRegionChange(e.target.value)}
        className="input"
      >
        <option value="">{t("create.selectRegion")}</option>
        {REGIONS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.nameUz}
          </option>
        ))}
      </select>
      <select
        value={districtId}
        onChange={(e) => handleDistrictChange(e.target.value)}
        disabled={!region}
        className="input disabled:opacity-50"
      >
        <option value="">{t("create.selectDistrict")}</option>
        {region?.districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nameUz}
          </option>
        ))}
      </select>
    </div>
  );
}
