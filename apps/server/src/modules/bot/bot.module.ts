import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
