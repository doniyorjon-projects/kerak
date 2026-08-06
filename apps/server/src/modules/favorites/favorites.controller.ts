import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { FavoritesService } from "./favorites.service";

@Controller("favorites")
@UseGuards(TelegramAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findMine(@CurrentUser() user: User) {
    return this.favoritesService.findMine(user.id);
  }

  @Get(":listingId")
  checkStatus(@Param("listingId") listingId: string, @CurrentUser() user: User) {
    return this.favoritesService.checkStatus(user.id, listingId);
  }

  @Post(":listingId")
  add(@Param("listingId") listingId: string, @CurrentUser() user: User) {
    return this.favoritesService.add(user.id, listingId);
  }

  @Delete(":listingId")
  remove(@Param("listingId") listingId: string, @CurrentUser() user: User) {
    return this.favoritesService.remove(user.id, listingId);
  }
}
