import { Module } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { WalletController } from "./wallet.controller";
import { PricingModule } from "../pricing/pricing.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { BotModule } from "../bot/bot.module";
import { PaymentsModule } from "../payments/payments.module";

@Module({
  imports: [PricingModule, NotificationsModule, BotModule, PaymentsModule],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
