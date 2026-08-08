import { Controller, Body, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { MessagesService } from "./messages.service";
import { SendMessageDto } from "./dto/send-message.dto";

@Controller("listings/:listingId/messages")
@UseGuards(TelegramAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findThread(@Param("listingId") listingId: string, @CurrentUser() user: User) {
    return this.messagesService.findThread(listingId, user.id);
  }

  @Post()
  send(
    @Param("listingId") listingId: string,
    @CurrentUser() user: User,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.send(user, listingId, dto.text);
  }
}
