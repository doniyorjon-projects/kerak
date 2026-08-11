import { Module } from "@nestjs/common";
import { PriceOffersService } from "./price-offers.service";
import { PriceOffersController } from "./price-offers.controller";
import { BotModule } from "../bot/bot.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [BotModule, NotificationsModule],
  providers: [PriceOffersService],
  controllers: [PriceOffersController],
})
export class PriceOffersModule {}
