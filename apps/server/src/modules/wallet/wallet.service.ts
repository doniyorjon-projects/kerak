import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BoostDuration, NotificationType, PlanTier, TopupMethod, WalletTransactionType } from "@prisma/client";
import { BOOST_DAYS, PLAN_LISTINGS_LIMIT } from "@kerak/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { PricingService } from "../pricing/pricing.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BotService } from "../bot/bot.service";
import { ClickService } from "../payments/click.service";

const BOOST_PRICE_FIELD: Record<BoostDuration, "boostDays3" | "boostDays7" | "boostDays30"> = {
  DAYS_3: "boostDays3",
  DAYS_7: "boostDays7",
  DAYS_30: "boostDays30",
};

const PLAN_PRICE_FIELD: Record<PlanTier, "planStandard" | "planBusiness"> = {
  STANDARD: "planStandard",
  BUSINESS: "planBusiness",
};

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
    private readonly notificationsService: NotificationsService,
    private readonly botService: BotService,
    private readonly clickService: ClickService,
  ) {}

  async get(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { balance: user.balance, transactions };
  }

  async credit(userId: string, amount: number, type: WalletTransactionType, note?: string) {
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { balance: { increment: amount } } }),
      this.prisma.walletTransaction.create({ data: { userId, amount, type, note } }),
    ]);
  }

  async createClickTopupOrder(userId: string, amount: number) {
    const order = await this.prisma.walletTopupOrder.create({
      data: { userId, amount, method: TopupMethod.CLICK },
    });
    return { orderId: order.id, amount, paymentUrl: this.clickService.buildPaymentUrl(order.id, amount) };
  }

  async createStarsInvoice(userId: string, amount: number) {
    const settings = await this.prisma.botSettings.findFirst();
    const starsRate = settings?.starsRate ?? 200;
    const starsAmount = Math.max(1, Math.ceil(amount / starsRate));
    const order = await this.prisma.walletTopupOrder.create({
      data: { userId, amount, method: TopupMethod.STARS, starsAmount },
    });
    const invoiceLink = await this.botService.createStarsInvoiceLink(
      order.id,
      "Hamyonni to'ldirish",
      `${amount.toLocaleString("uz-UZ")} so'm hamyoningizga qo'shiladi`,
      starsAmount,
    );
    return { orderId: order.id, starsAmount, invoiceLink };
  }

  async payBoostWithBalance(userId: string, listingId: string, duration: BoostDuration) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== userId) throw new ForbiddenException("Bu sizning eloningiz emas");

    const pricing = await this.pricingService.get();
    const amount = pricing[BOOST_PRICE_FIELD[duration]];
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.balance < amount) throw new BadRequestException("Balansingizda mablag' yetarli emas");

    const days = BOOST_DAYS[duration];
    const base = listing.boostedUntil && listing.boostedUntil > new Date() ? listing.boostedUntil : new Date();
    const boostedUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { balance: { decrement: amount } } }),
      this.prisma.walletTransaction.create({
        data: { userId, amount: -amount, type: WalletTransactionType.BOOST_PURCHASE, note: listing.title },
      }),
      this.prisma.listing.update({ where: { id: listingId }, data: { boostedUntil } }),
    ]);

    await this.notificationsService.create(
      userId,
      NotificationType.BOOST_PAID,
      "To'lov muvaffaqiyatli o'tdi ✅",
      `"${listing.title}" eloningiz ${boostedUntil.toLocaleDateString("uz-UZ")} gacha ko'tarildi.`,
      `/listings/${listingId}`,
    );

    if (listing.status === "ACTIVE") {
      await this.botService.postToChannel(listing);
    }

    return this.prisma.listing.findUnique({ where: { id: listingId } });
  }

  async payPlanWithBalance(userId: string, tier: PlanTier) {
    const pricing = await this.pricingService.get();
    const amount = pricing[PLAN_PRICE_FIELD[tier]];
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.balance < amount) throw new BadRequestException("Balansingizda mablag' yetarli emas");

    const newLimit = Math.max(user.listingsLimit, PLAN_LISTINGS_LIMIT[tier]);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount }, listingsLimit: newLimit },
      }),
      this.prisma.walletTransaction.create({
        data: { userId, amount: -amount, type: WalletTransactionType.PLAN_PURCHASE, note: tier },
      }),
    ]);

    await this.notificationsService.create(
      userId,
      NotificationType.PLAN_PAID,
      "To'lov muvaffaqiyatli o'tdi ✅",
      `Tarifingiz faollashtirildi. Endi ${newLimit >= 9999 ? "cheksiz" : newLimit} tagacha faol e'lon joylashingiz mumkin.`,
      "/profile",
    );

    return this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }
}
