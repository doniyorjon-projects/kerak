import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { BoostsService } from "./boosts.service";
import { CreateBoostDto } from "./dto/create-boost.dto";

@UseGuards(TelegramAuthGuard)
@Controller()
export class BoostsController {
  constructor(private readonly boostsService: BoostsService) {}

  @Post("listings/:listingId/boost")
  create(
    @Param("listingId") listingId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateBoostDto,
  ) {
    return this.boostsService.create(user.id, listingId, dto.duration);
  }

  @Get("boost-orders/:orderId")
  getStatus(@Param("orderId") orderId: string, @CurrentUser() user: User) {
    return this.boostsService.getStatus(user.id, orderId);
  }
}
