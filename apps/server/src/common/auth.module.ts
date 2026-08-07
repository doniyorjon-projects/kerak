import { Global, Module } from "@nestjs/common";
import { UsersService } from "../modules/users/users.service";
import { TelegramAuthGuard } from "./telegram-auth.guard";
import { AdminGuard } from "./admin.guard";
import { OptionalAuthGuard } from "./optional-auth.guard";
import { NotificationsModule } from "../modules/notifications/notifications.module";

/**
 * UsersService bu yerda joylashgan, chunki TelegramAuthGuard unga bog'liq -
 * guard @UseGuards() orqali class sifatida ishlatilganda, uning
 * dependency'lari FAQAT shu guard joylashgan modul ichida yechiladi
 * (NestJS'ning modul chegaralari bo'yicha bilinadigan xatti-harakati).
 */
@Global()
@Module({
  imports: [NotificationsModule],
  providers: [UsersService, TelegramAuthGuard, AdminGuard, OptionalAuthGuard],
  exports: [UsersService, TelegramAuthGuard, AdminGuard, OptionalAuthGuard],
})
export class AuthModule {}
