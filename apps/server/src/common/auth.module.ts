import { Global, Module } from "@nestjs/common";
import { UsersService } from "../modules/users/users.service";
import { TelegramAuthGuard } from "./telegram-auth.guard";
import { AdminGuard } from "./admin.guard";

/**
 * UsersService bu yerda joylashgan, chunki TelegramAuthGuard unga bog'liq -
 * guard @UseGuards() orqali class sifatida ishlatilganda, uning
 * dependency'lari FAQAT shu guard joylashgan modul ichida yechiladi
 * (NestJS'ning modul chegaralari bo'yicha bilinadigan xatti-harakati).
 */
@Global()
@Module({
  providers: [UsersService, TelegramAuthGuard, AdminGuard],
  exports: [UsersService, TelegramAuthGuard, AdminGuard],
})
export class AuthModule {}
