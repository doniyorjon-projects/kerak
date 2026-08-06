import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { ListingsService } from "./listings.service";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { ContactEventDto } from "./dto/contact-event.dto";
import { FindFeedDto } from "./dto/find-feed.dto";

@Controller("listings")
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findFeed(@Query() query: FindFeedDto) {
    return this.listingsService.findFeed(query);
  }

  @UseGuards(TelegramAuthGuard)
  @Get("mine")
  findMine(@CurrentUser() user: User) {
    return this.listingsService.findMine(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(TelegramAuthGuard)
  @Get(":id/stats")
  getStats(@Param("id") id: string, @CurrentUser() user: User) {
    return this.listingsService.getStats(id, user.id);
  }

  @UseGuards(TelegramAuthGuard)
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user.id, dto);
  }

  @UseGuards(TelegramAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @CurrentUser() user: User, @Body() dto: UpdateListingDto) {
    return this.listingsService.update(id, user.id, dto);
  }

  @UseGuards(TelegramAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.listingsService.remove(id, user.id);
  }

  @UseGuards(TelegramAuthGuard)
  @Post(":id/contact-event")
  logContactEvent(@Param("id") id: string, @CurrentUser() user: User, @Body() dto: ContactEventDto) {
    return this.listingsService.logContactEvent(id, user.id, dto.type);
  }
}
