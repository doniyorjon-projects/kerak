import { REGIONS, type District, type Region } from "../data/uzbekistanRegions";

/**
 * Foydalanuvchining lat/lng'iga eng yaqin viloyat (va agar aniqroq bo'lsa,
 * tuman) markazini topadi - tashqi geokodlash xizmatiga so'rov yubormasdan,
 * mavjud REGIONS ma'lumotlaridan foydalanib. Masofalar kichik (bir mamlakat
 * ichida) bo'lgani uchun tekis tekislik taxminiy hisobi yetarli.
 */
export function findNearestPlace(lat: number, lng: number): { region: Region; district: District | null } | null {
  if (REGIONS.length === 0) return null;

  let bestRegion = REGIONS[0];
  let bestRegionDist = Infinity;
  for (const region of REGIONS) {
    const d = (region.lat - lat) ** 2 + (region.lng - lng) ** 2;
    if (d < bestRegionDist) {
      bestRegionDist = d;
      bestRegion = region;
    }
  }

  let bestDistrict: District | null = null;
  let bestDistrictDist = Infinity;
  for (const district of bestRegion.districts) {
    const d = (district.lat - lat) ** 2 + (district.lng - lng) ** 2;
    if (d < bestDistrictDist) {
      bestDistrictDist = d;
      bestDistrict = district;
    }
  }

  return { region: bestRegion, district: bestDistrict };
}
