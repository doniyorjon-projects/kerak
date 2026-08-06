import { IsIn } from "class-validator";
import { PlanTier } from "@prisma/client";

const TIERS: PlanTier[] = ["STANDARD", "BUSINESS"];

export class CreatePlanOrderDto {
  @IsIn(TIERS)
  tier!: PlanTier;
}
