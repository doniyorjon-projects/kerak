import { Module } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { BotModule } from "../bot/bot.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { BlocksModule } from "../blocks/blocks.module";

@Module({
  imports: [BotModule, NotificationsModule, BlocksModule],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
