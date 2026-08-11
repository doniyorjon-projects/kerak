import { IsBoolean } from "class-validator";

export class ResolvePriceOfferDto {
  @IsBoolean()
  accept!: boolean;
}
