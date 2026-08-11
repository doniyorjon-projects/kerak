import { IsOptional, IsString, MaxLength } from "class-validator";

export class SetSupportUrlDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  supportUrl?: string | null;
}
