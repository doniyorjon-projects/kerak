import { IsString, MaxLength, MinLength } from "class-validator";

export class SuggestCategoryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;
}
