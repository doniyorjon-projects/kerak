import type { PricingConfigDto } from "@kerak/shared";
import { api } from "./client";

export function fetchPricing() {
  return api.get<PricingConfigDto>("/pricing");
}

export function updatePricing(data: Partial<PricingConfigDto>) {
  return api.patch<PricingConfigDto>("/admin/pricing", data);
}
