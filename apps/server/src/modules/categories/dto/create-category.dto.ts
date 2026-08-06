import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { CategoryType } from "@prisma/client";

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  nameUz!: string;

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
