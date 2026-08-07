import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { SettingsModule } from "../settings/settings.module";
import { BlocksModule } from "../blocks/blocks.module";

@Module({
  imports: [NotificationsModule, SettingsModule, BlocksModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
