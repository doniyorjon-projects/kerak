import { Module } from "@nestjs/common";
import { ClickService } from "./click.service";
import { ClickController } from "./click.controller";
import { BoostsService } from "./boosts.service";
import { BoostsController } from "./boosts.controller";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  providers: [ClickService, BoostsService],
  controllers: [ClickController, BoostsController],
})
export class PaymentsModule {}
