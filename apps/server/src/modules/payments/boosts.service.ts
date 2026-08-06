import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BoostDuration } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ClickService } from "./click.service";
import { PricingService } from "../pricing/pricing.service";

const PRICING_FIELD: Record<BoostDuration, "boostDays3" | "boostDays7" | "boostDays30"> = {
  DAYS_3: "boostDays3",
  DAYS_7: "boostDays7",
  DAYS_30: "boostDays30",
};

@Injectable()
export class BoostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clickService: ClickService,
    private readonly pricingService: PricingService,
  ) {}

  async create(userId: string, listingId: string, duration: BoostDuration) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== userId) throw new ForbiddenException("Bu sizning eloningiz emas");

    const pricing = await this.pricingService.get();
    const amount = pricing[PRICING_FIELD[duration]];
    const order = await this.prisma.boostOrder.create({
      data: { listingId, userId, duration, amount },
    });

    return {
      orderId: order.id,
      amount,
      paymentUrl: this.clickService.buildPaymentUrl(order.id, amount),
    };
  }

  async getStatus(userId: string, orderId: string) {
    const order = await this.prisma.boostOrder.findUnique({
      where: { id: orderId },
      include: { listing: { select: { boostedUntil: true } } },
    });
    if (!order) throw new NotFoundException("Buyurtma topilmadi");
    if (order.userId !== userId) throw new ForbiddenException("Bu sizning buyurtmangiz emas");

    return {
      status: order.status,
      boostedUntil: order.listing.boostedUntil,
    };
  }
}
