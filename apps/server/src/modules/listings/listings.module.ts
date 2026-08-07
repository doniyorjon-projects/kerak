import { Module } from "@nestjs/common";
import { ListingsService } from "./listings.service";
import { ListingsController } from "./listings.controller";
import { ListingsExpiryService } from "./listings-expiry.service";
import { BotModule } from "../bot/bot.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [BotModule, NotificationsModule],
  providers: [ListingsService, ListingsExpiryService],
  controllers: [ListingsController],
  exports: [ListingsService],
})
export class ListingsModule {}
