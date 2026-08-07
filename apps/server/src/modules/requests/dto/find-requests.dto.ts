import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FindRequestsDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  regionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  districtId?: number;

  @IsOptional()
  @IsString()
  q?: string;
}
