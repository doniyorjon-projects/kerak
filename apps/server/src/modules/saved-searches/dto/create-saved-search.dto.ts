import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ListingCondition } from "@prisma/client";

export class CreateSavedSearchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  label!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  regionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  districtId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ListingCondition)
  condition?: ListingCondition;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
