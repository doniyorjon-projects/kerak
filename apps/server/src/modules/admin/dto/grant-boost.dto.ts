import { IsEnum } from "class-validator";
import { BoostDuration } from "@prisma/client";

export class GrantBoostDto {
  @IsEnum(BoostDuration)
  duration!: BoostDuration;
}
