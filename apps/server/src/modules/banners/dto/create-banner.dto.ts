import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateBannerDto {
  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
