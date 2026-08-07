import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { ReportsModule } from "../reports/reports.module";
import { BannersModule } from "../banners/banners.module";
import { CategoriesModule } from "../categories/categories.module";
import { PricingModule } from "../pricing/pricing.module";
import { BotModule } from "../bot/bot.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { SettingsModule } from "../settings/settings.module";
import { RequestsModule } from "../requests/requests.module";

@Module({
  imports: [
    ReportsModule,
    BannersModule,
    CategoriesModule,
    PricingModule,
    BotModule,
    NotificationsModule,
    SettingsModule,
    RequestsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
