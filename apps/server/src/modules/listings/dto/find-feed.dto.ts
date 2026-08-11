import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { ListingCondition } from "@prisma/client";
import { FeedSort } from "../listings.service";

const SORT_VALUES: FeedSort[] = ["distance", "newest", "price_asc", "price_desc"];

function parseAttributesParam(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

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

  @IsOptional()
  @IsEnum(ListingCondition)
  condition?: ListingCondition;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  hasDelivery?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseAttributesParam(value))
  attributes?: Record<string, string>;

  /** Multiselect - qiymat massiv ichida bormi (masalan {"amenities":"Lift"}). */
  @IsOptional()
  @Transform(({ value }) => parseAttributesParam(value))
  attributesAny?: Record<string, string>;

  /** Number/decimal maydonlar uchun oraliq filtri. */
  @IsOptional()
  @Transform(({ value }) => parseAttributesParam(value))
  attributesMin?: Record<string, string>;

  @IsOptional()
  @Transform(({ value }) => parseAttributesParam(value))
  attributesMax?: Record<string, string>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}
