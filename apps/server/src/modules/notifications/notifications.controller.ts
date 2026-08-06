import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(TelegramAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@CurrentUser() user: User) {
    return this.notificationsService.findMine(user.id);
  }

  @Get("unread-count")
  unreadCount(@CurrentUser() user: User) {
    return this.notificationsService.unreadCount(user.id);
  }

  @Patch("read-all")
  markAllRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch(":id/read")
  markRead(@Param("id") id: string, @CurrentUser() user: User) {
    return this.notificationsService.markRead(user.id, id);
  }
}
