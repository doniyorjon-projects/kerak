import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class SetUsdRateDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usdRate!: number;
}
