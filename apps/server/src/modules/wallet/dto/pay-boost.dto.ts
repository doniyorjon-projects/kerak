import { IsIn } from "class-validator";
import { BoostDuration } from "@prisma/client";

const DURATIONS: BoostDuration[] = ["DAYS_3", "DAYS_7", "DAYS_30"];

export class PayBoostDto {
  @IsIn(DURATIONS)
  duration!: BoostDuration;
}
