import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { RatingsService } from "./ratings.service";
import { CreateRatingDto } from "./dto/create-rating.dto";

@Controller()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @UseGuards(TelegramAuthGuard)
  @Post("listings/:listingId/ratings")
  upsert(
    @Param("listingId") listingId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.upsert(user.id, listingId, dto.stars, dto.comment);
  }

  @UseGuards(TelegramAuthGuard)
  @Get("listings/:listingId/ratings/me")
  findMine(@Param("listingId") listingId: string, @CurrentUser() user: User) {
    return this.ratingsService.findMine(user.id, listingId);
  }

  @Get("sellers/:sellerId/rating-summary")
  getSellerSummary(@Param("sellerId") sellerId: string) {
    return this.ratingsService.getSellerSummary(sellerId);
  }
}
