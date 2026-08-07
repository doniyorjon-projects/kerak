import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { BlocksService } from "./blocks.service";

@Controller("blocks")
@UseGuards(TelegramAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  findMine(@CurrentUser() user: User) {
    return this.blocksService.findMine(user.id);
  }

  @Get(":userId")
  checkStatus(@Param("userId") userId: string, @CurrentUser() user: User) {
    return this.blocksService.checkStatus(user.id, userId);
  }

  @Post(":userId")
  block(@Param("userId") userId: string, @CurrentUser() user: User) {
    return this.blocksService.block(user.id, userId);
  }

  @Delete(":userId")
  unblock(@Param("userId") userId: string, @CurrentUser() user: User) {
    return this.blocksService.unblock(user.id, userId);
  }
}
