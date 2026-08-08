import { Module } from "@nestjs/common";
import { RatingsService } from "./ratings.service";
import { RatingsController } from "./ratings.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { BotModule } from "../bot/bot.module";

@Module({
  imports: [NotificationsModule, BotModule],
  providers: [RatingsService],
  controllers: [RatingsController],
})
export class RatingsModule {}
