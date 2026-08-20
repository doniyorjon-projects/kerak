import { IsString, MinLength } from "class-validator";

export class SetOpenrouterApiKeyDto {
  @IsString()
  @MinLength(20)
  apiKey!: string;
}
