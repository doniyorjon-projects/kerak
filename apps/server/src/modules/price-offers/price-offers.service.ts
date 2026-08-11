import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType, PriceOfferStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { BotService } from "../bot/bot.service";
import { NotificationsService } from "../notifications/notifications.service";

const OFFER_INCLUDE = {
  buyer: { select: { id: true, telegramId: true, username: true, firstName: true } },
} as const;

@Injectable()
export class PriceOffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(listingId: string, buyerId: string, amount: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId }, include: { seller: true } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId === buyerId) throw new ForbiddenException("O'z eloningizga taklif berolmaysiz");
    if (listing.price == null) throw new BadRequestException("Bu elonda narx belgilanmagan");

    const offer = await this.prisma.priceOffer.create({
      data: { listingId, buyerId, amount },
      include: OFFER_INCLUDE,
    });

    await this.notificationsService.create(
      listing.sellerId,
      NotificationType.PRICE_OFFER_RECEIVED,
      "Yangi narx taklifi 💬",
      `"${listing.title}" eloningizga ${offer.buyer.username ? "@" + offer.buyer.username : offer.buyer.firstName} ${amount.toLocaleString("uz-UZ")} so'm taklif qildi.`,
      `/listings/${listingId}`,
    );
    await this.botService.notifyPriceOffer(
      listing.seller.telegramId,
      listingId,
      listing.title,
      amount,
      offer.buyer.username ? `@${offer.buyer.username}` : offer.buyer.firstName,
    );

    return offer;
  }

  async findForListing(listingId: string, sellerId: string, isAdmin = false) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== sellerId && !isAdmin) throw new ForbiddenException("Bu sizning eloningiz emas");

    return this.prisma.priceOffer.findMany({
      where: { listingId },
      include: OFFER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async findMine(listingId: string, buyerId: string) {
    return this.prisma.priceOffer.findFirst({
      where: { listingId, buyerId },
      include: OFFER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async resolve(offerId: string, sellerId: string, accept: boolean, isAdmin = false) {
    const offer = await this.prisma.priceOffer.findUnique({
      where: { id: offerId },
      include: { listing: true, buyer: true },
    });
    if (!offer) throw new NotFoundException("Taklif topilmadi");
    if (offer.listing.sellerId !== sellerId && !isAdmin) throw new ForbiddenException("Bu sizning eloningiz emas");
    if (offer.status !== PriceOfferStatus.PENDING) throw new BadRequestException("Bu taklif allaqachon ko'rib chiqilgan");

    const updated = await this.prisma.priceOffer.update({
      where: { id: offerId },
      data: { status: accept ? PriceOfferStatus.ACCEPTED : PriceOfferStatus.REJECTED },
      include: OFFER_INCLUDE,
    });

    await this.notificationsService.create(
      offer.buyerId,
      NotificationType.PRICE_OFFER_RESOLVED,
      accept ? "Taklifingiz qabul qilindi ✅" : "Taklifingiz rad etildi ❌",
      accept
        ? `"${offer.listing.title}" eloniga ${offer.amount.toLocaleString("uz-UZ")} so'm taklifingiz qabul qilindi.`
        : `"${offer.listing.title}" eloniga ${offer.amount.toLocaleString("uz-UZ")} so'm taklifingiz rad etildi.`,
      `/listings/${offer.listingId}`,
    );
    await this.botService.notifyPriceOfferResolved(offer.buyer.telegramId, offer.listingId, offer.listing.title, accept);

    return updated;
  }
}
