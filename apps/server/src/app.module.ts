import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./common/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ListingsModule } from "./modules/listings/listings.module";
import { AdminModule } from "./modules/admin/admin.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { BotModule } from "./modules/bot/bot.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { RatingsModule } from "./modules/ratings/ratings.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { BannersModule } from "./modules/banners/banners.module";
import { MetaModule } from "./modules/meta/meta.module";
import { RequestsModule } from "./modules/requests/requests.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { BlocksModule } from "./modules/blocks/blocks.module";
import { SavedSearchesModule } from "./modules/saved-searches/saved-searches.module";
import { WalletModule } from "./modules/wallet/wallet.module";
import { AiModule } from "./modules/ai/ai.module";
import { PriceOffersModule } from "./modules/price-offers/price-offers.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    BotModule,
    ListingsModule,
    AdminModule,
    UploadsModule,
    FavoritesModule,
    MessagesModule,
    ReportsModule,
    RatingsModule,
    PaymentsModule,
    NotificationsModule,
    BannersModule,
    MetaModule,
    RequestsModule,
    SettingsModule,
    BlocksModule,
    SavedSearchesModule,
    WalletModule,
    AiModule,
    PriceOffersModule,
  ],
})
export class AppModule {}
