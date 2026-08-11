import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { CategoryType } from "@prisma/client";

export class CreateCategoryDto {
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: "id faqat kichik lotin harflari, raqam va tire (-) dan iborat bo'lishi kerak" })
  @MinLength(2)
  @MaxLength(60)
  id!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  nameUz!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  nameRu?: string;

  @IsEnum(CategoryType)
  type!: CategoryType;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
