import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class SetStarsRateDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  starsRate!: number;
}
