import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { PlansService } from "./plans.service";
import { CreatePlanOrderDto } from "./dto/create-plan-order.dto";

@UseGuards(TelegramAuthGuard)
@Controller()
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post("plans/order")
  create(@CurrentUser() user: User, @Body() dto: CreatePlanOrderDto) {
    return this.plansService.create(user.id, dto.tier);
  }

  @Get("plan-orders/:orderId")
  getStatus(@Param("orderId") orderId: string, @CurrentUser() user: User) {
    return this.plansService.getStatus(user.id, orderId);
  }
}
