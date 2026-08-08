import { IsString, MaxLength, MinLength } from "class-validator";

export class ReplyRatingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reply!: string;
}
