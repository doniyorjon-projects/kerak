import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";
import { UNLIMITED_LISTINGS } from "@kerak/shared";

export class SetListingsLimitDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(UNLIMITED_LISTINGS)
  limit!: number;
}
