import { Module } from "@nestjs/common";
import { ClickService } from "./click.service";
import { ClickController } from "./click.controller";
import { BoostsService } from "./boosts.service";
import { BoostsController } from "./boosts.controller";
import { PlansService } from "./plans.service";
import { PlansController } from "./plans.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { PricingModule } from "../pricing/pricing.module";
import { BotModule } from "../bot/bot.module";

@Module({
  imports: [NotificationsModule, PricingModule, BotModule],
  providers: [ClickService, BoostsService, PlansService],
  controllers: [ClickController, BoostsController, PlansController],
  exports: [ClickService],
})
export class PaymentsModule {}
