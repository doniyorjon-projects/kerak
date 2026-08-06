import type { CreatePlanOrderResultDto, PlanOrderStatusDto, PlanTier } from "@kerak/shared";
import { api } from "./client";

export function createPlanOrder(tier: PlanTier) {
  return api.post<CreatePlanOrderResultDto>("/plans/order", { tier });
}

export function fetchPlanOrderStatus(orderId: string) {
  return api.get<PlanOrderStatusDto>(`/plan-orders/${orderId}`);
}
