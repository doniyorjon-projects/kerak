import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { SavedSearchesService } from "./saved-searches.service";
import { CreateSavedSearchDto } from "./dto/create-saved-search.dto";

@Controller("saved-searches")
@UseGuards(TelegramAuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Get()
  findMine(@CurrentUser() user: User) {
    return this.savedSearchesService.findMine(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateSavedSearchDto) {
    return this.savedSearchesService.create(user.id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.savedSearchesService.remove(id, user.id);
  }
}
