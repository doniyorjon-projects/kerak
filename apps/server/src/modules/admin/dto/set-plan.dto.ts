import { IsEnum } from "class-validator";
import { PlanTier } from "@prisma/client";

export class SetPlanDto {
  @IsEnum(PlanTier)
  tier!: PlanTier;
}
