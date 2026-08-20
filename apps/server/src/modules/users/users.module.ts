import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { SellerProfileController } from "./seller-profile.controller";
import { BotModule } from "../bot/bot.module";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [BotModule, SettingsModule],
  controllers: [UsersController, SellerProfileController],
})
export class UsersModule {}
