import { IsString, MinLength } from "class-validator";

export class AddAdminDto {
  @IsString()
  @MinLength(2)
  identifier!: string;
}
