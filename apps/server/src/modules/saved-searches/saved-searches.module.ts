import { Module } from "@nestjs/common";
import { SavedSearchesService } from "./saved-searches.service";
import { SavedSearchesController } from "./saved-searches.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { BotModule } from "../bot/bot.module";

@Module({
  imports: [NotificationsModule, BotModule],
  providers: [SavedSearchesService],
  controllers: [SavedSearchesController],
  exports: [SavedSearchesService],
})
export class SavedSearchesModule {}
