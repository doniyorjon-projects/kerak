import { IsOptional, IsString, MaxLength } from "class-validator";

export class RejectListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
