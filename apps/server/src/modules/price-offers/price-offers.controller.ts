import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { PriceOffersService } from "./price-offers.service";
import { CreatePriceOfferDto } from "./dto/create-price-offer.dto";
import { ResolvePriceOfferDto } from "./dto/resolve-price-offer.dto";

@Controller()
@UseGuards(TelegramAuthGuard)
export class PriceOffersController {
  constructor(private readonly priceOffersService: PriceOffersService) {}

  @Post("listings/:listingId/offers")
  create(@Param("listingId") listingId: string, @CurrentUser() user: User, @Body() dto: CreatePriceOfferDto) {
    return this.priceOffersService.create(listingId, user.id, dto.amount);
  }

  @Get("listings/:listingId/offers")
  findForListing(@Param("listingId") listingId: string, @CurrentUser() user: User) {
    return this.priceOffersService.findForListing(listingId, user.id, user.isAdmin);
  }

  @Get("listings/:listingId/offers/mine")
  findMine(@Param("listingId") listingId: string, @CurrentUser() user: User) {
    return this.priceOffersService.findMine(listingId, user.id);
  }

  @Patch("offers/:id")
  resolve(@Param("id") id: string, @CurrentUser() user: User, @Body() dto: ResolvePriceOfferDto) {
    return this.priceOffersService.resolve(id, user.id, dto.accept, user.isAdmin);
  }
}
