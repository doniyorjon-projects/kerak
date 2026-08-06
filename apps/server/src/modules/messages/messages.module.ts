import { Module } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { BotModule } from "../bot/bot.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [BotModule, NotificationsModule],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
