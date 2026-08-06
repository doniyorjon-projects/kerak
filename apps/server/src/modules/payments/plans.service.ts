import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PlanTier } from "@prisma/client";
import { PLAN_LISTINGS_LIMIT } from "@kerak/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { ClickService } from "./click.service";
import { PricingService } from "../pricing/pricing.service";

const PRICING_FIELD: Record<PlanTier, "planStandard" | "planBusiness"> = {
  STANDARD: "planStandard",
  BUSINESS: "planBusiness",
};

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clickService: ClickService,
    private readonly pricingService: PricingService,
  ) {}

  async create(userId: string, tier: PlanTier) {
    const pricing = await this.pricingService.get();
    const amount = pricing[PRICING_FIELD[tier]];
    const listingsLimit = PLAN_LISTINGS_LIMIT[tier];
    const order = await this.prisma.planOrder.create({
      data: { userId, tier, amount, listingsLimit },
    });

    return {
      orderId: order.id,
      amount,
      paymentUrl: this.clickService.buildPaymentUrl(order.id, amount),
    };
  }

  async getStatus(userId: string, orderId: string) {
    const order = await this.prisma.planOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException("Buyurtma topilmadi");
    if (order.userId !== userId) throw new ForbiddenException("Bu sizning buyurtmangiz emas");

    return {
      status: order.status,
      listingsLimit: order.listingsLimit,
    };
  }
}
