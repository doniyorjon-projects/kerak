import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BoostDuration } from "@prisma/client";
import { BOOST_PRICING } from "@kerak/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { ClickService } from "./click.service";

@Injectable()
export class BoostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clickService: ClickService,
  ) {}

  async create(userId: string, listingId: string, duration: BoostDuration) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== userId) throw new ForbiddenException("Bu sizning eloningiz emas");

    const amount = BOOST_PRICING[duration];
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
