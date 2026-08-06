import { Transform, Type } from "class-transformer";
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { FeedSort } from "../listings.service";

const SORT_VALUES: FeedSort[] = ["distance", "newest", "price_asc", "price_desc"];

export class FindFeedDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number;

  @IsOptional()
  @IsIn(SORT_VALUES)
  sort?: FeedSort;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  boostedOnly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  regionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  districtId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}
