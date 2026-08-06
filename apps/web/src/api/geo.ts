import { api } from "./client";

export interface ReverseGeocodeResult {
  displayName: string | null;
  place: string | null;
  district: string | null;
  region: string | null;
}

export function reverseGeocode(lat: number, lng: number) {
  return api.get<ReverseGeocodeResult>(`/geo/reverse?lat=${lat}&lng=${lng}`);
}
