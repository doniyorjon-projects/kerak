import { IsOptional, IsString, MaxLength } from "class-validator";

export class SetChannelDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  channelId?: string | null;
}
