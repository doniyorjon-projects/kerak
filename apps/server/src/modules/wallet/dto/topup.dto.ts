import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class TopupDto {
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  amount!: number;
}
