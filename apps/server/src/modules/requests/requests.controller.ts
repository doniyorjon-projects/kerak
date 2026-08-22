import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { OptionalAuthGuard } from "../../common/optional-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { RequestsService } from "./requests.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { FindRequestsDto } from "./dto/find-requests.dto";

@Controller("requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  findFeed(@Query() query: FindRequestsDto) {
    return this.requestsService.findFeed(query);
  }

  @UseGuards(TelegramAuthGuard)
  @Get("mine")
  findMine(@CurrentUser() user: User) {
    return this.requestsService.findMine(user.id);
  }

  @UseGuards(OptionalAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() viewer?: User) {
    return this.requestsService.findOne(id, viewer?.id);
  }

  @UseGuards(TelegramAuthGuard)
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(user.id, dto);
  }

  @UseGuards(TelegramAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @CurrentUser() user: User, @Body() dto: UpdateRequestDto) {
    return this.requestsService.update(id, user.id, dto, user.isAdmin);
  }

  @UseGuards(TelegramAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.requestsService.remove(id, user.id, user.isAdmin);
  }
}
