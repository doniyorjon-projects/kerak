import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export const REQUEST_SETTABLE_STATUSES = ["ACTIVE", "CLOSED"] as const;

export class UpdateRequestDto {
  @IsOptional()
  @IsIn(REQUEST_SETTABLE_STATUSES)
  status?: (typeof REQUEST_SETTABLE_STATUSES)[number];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budgetMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budgetMax?: number | null;

  @IsOptional()
  @IsString()
  addressText?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  regionId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  districtId?: number | null;

  @IsOptional()
  @Matches(/^\+?[0-9]{9,15}$/, { message: "Telefon raqami noto'g'ri formatda" })
  phone?: string;
}
