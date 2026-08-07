import { Module } from "@nestjs/common";
import { SavedSearchesService } from "./saved-searches.service";
import { SavedSearchesController } from "./saved-searches.controller";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  providers: [SavedSearchesService],
  controllers: [SavedSearchesController],
  exports: [SavedSearchesService],
})
export class SavedSearchesModule {}
