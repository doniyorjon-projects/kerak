import { Module } from "@nestjs/common";
import { RatingsService } from "./ratings.service";
import { RatingsController } from "./ratings.controller";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  providers: [RatingsService],
  controllers: [RatingsController],
})
export class RatingsModule {}
