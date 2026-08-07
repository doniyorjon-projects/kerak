import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { WalletService } from "./wallet.service";
import { TopupDto } from "./dto/topup.dto";
import { PayBoostDto } from "./dto/pay-boost.dto";
import { PayPlanDto } from "./dto/pay-plan.dto";

@Controller("wallet")
@UseGuards(TelegramAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  get(@CurrentUser() user: User) {
    return this.walletService.get(user.id);
  }

  @Post("topup/click")
  topupClick(@CurrentUser() user: User, @Body() dto: TopupDto) {
    return this.walletService.createClickTopupOrder(user.id, dto.amount);
  }

  @Post("topup/stars")
  topupStars(@CurrentUser() user: User, @Body() dto: TopupDto) {
    return this.walletService.createStarsInvoice(user.id, dto.amount);
  }

  @Post("pay-boost/:listingId")
  payBoost(@Param("listingId") listingId: string, @CurrentUser() user: User, @Body() dto: PayBoostDto) {
    return this.walletService.payBoostWithBalance(user.id, listingId, dto.duration);
  }

  @Post("pay-plan")
  payPlan(@CurrentUser() user: User, @Body() dto: PayPlanDto) {
    return this.walletService.payPlanWithBalance(user.id, dto.tier);
  }
}
