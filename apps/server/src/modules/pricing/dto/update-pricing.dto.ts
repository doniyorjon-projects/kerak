import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class UpdatePricingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  boostDays3?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  boostDays7?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  boostDays30?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  planStandard?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  planBusiness?: number;
}
