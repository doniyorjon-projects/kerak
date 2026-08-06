import { Module } from "@nestjs/common";
import { ClickService } from "./click.service";
import { ClickController } from "./click.controller";
import { BoostsService } from "./boosts.service";
import { BoostsController } from "./boosts.controller";
import { PlansService } from "./plans.service";
import { PlansController } from "./plans.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { PricingModule } from "../pricing/pricing.module";

@Module({
  imports: [NotificationsModule, PricingModule],
  providers: [ClickService, BoostsService, PlansService],
  controllers: [ClickController, BoostsController, PlansController],
})
export class PaymentsModule {}
