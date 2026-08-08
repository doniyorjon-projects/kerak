import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { ListingCondition } from "@prisma/client";

export class CreateListingDto {
  @IsString()
  categoryId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  brand?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  photos!: string[];

  @IsOptional()
  @IsString()
  addressText?: string;

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
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @Matches(/^\+?[0-9]{9,15}$/, { message: "Telefon raqami noto'g'ri formatda" })
  phone!: string;

  @IsOptional()
  @IsEnum(ListingCondition)
  condition?: ListingCondition;
}
