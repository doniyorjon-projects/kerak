import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateRequestDto {
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

  @Matches(/^\+?[0-9]{9,15}$/, { message: "Telefon raqami noto'g'ri formatda" })
  phone!: string;
}
