import { Module } from "@nestjs/common";
import { MetaController } from "./meta.controller";
import { PricingModule } from "../pricing/pricing.module";

@Module({
  imports: [PricingModule],
  controllers: [MetaController],
})
export class MetaModule {}
