import { IsOptional, IsString, MaxLength } from "class-validator";

export class SetTelegramChannelUrlDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  telegramChannelUrl?: string | null;
}
