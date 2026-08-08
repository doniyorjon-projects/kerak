import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class GenerateDescriptionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  categoryName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  draft?: string;
}
