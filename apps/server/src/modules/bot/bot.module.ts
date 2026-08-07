import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [NotificationsModule, SettingsModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
