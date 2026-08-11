import { IsString, MinLength } from "class-validator";

export class SetAnthropicApiKeyDto {
  @IsString()
  @MinLength(20)
  apiKey!: string;
}
