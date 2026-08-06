import { Module } from "@nestjs/common";
import { ListingsService } from "./listings.service";
import { ListingsController } from "./listings.controller";
import { BotModule } from "../bot/bot.module";

@Module({
  imports: [BotModule],
  providers: [ListingsService],
  controllers: [ListingsController],
  exports: [ListingsService],
})
export class ListingsModule {}
