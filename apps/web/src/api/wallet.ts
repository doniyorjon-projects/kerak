import type {
  BoostDuration,
  ListingDto,
  PlanTier,
  StarsInvoiceResultDto,
  WalletDto,
  WalletTopupResultDto,
} from "@kerak/shared";
import { api } from "./client";

export function fetchWallet() {
  return api.get<WalletDto>("/wallet");
}

export function topupWithClick(amount: number) {
  return api.post<WalletTopupResultDto>("/wallet/topup/click", { amount });
}

export function topupWithStars(amount: number) {
  return api.post<StarsInvoiceResultDto>("/wallet/topup/stars", { amount });
}

export function payBoostWithBalance(listingId: string, duration: BoostDuration) {
  return api.post<ListingDto>(`/wallet/pay-boost/${listingId}`, { duration });
}

export function payPlanWithBalance(tier: PlanTier) {
  return api.post<{ listingsLimit: number }>("/wallet/pay-plan", { tier });
}
