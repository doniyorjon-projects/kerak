import { IsNumber, IsOptional, Matches } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @Matches(/^\+?[0-9]{9,15}$/, { message: "Telefon raqami noto'g'ri formatda" })
  phone?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
