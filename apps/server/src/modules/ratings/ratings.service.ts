import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import { VERIFIED_SELLER_MIN_AVG, VERIFIED_SELLER_MIN_RATINGS } from "@kerak/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BotService } from "../bot/bot.service";

@Injectable()
export class RatingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly botService: BotService,
  ) {}

  async upsert(raterId: string, listingId: string, stars: number, comment?: string, isAnonymous?: boolean) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId }, include: { seller: true } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId === raterId) {
      throw new BadRequestException("O'zingizni baholay olmaysiz");
    }

    const rating = await this.prisma.rating.upsert({
      where: { listingId_raterId: { listingId, raterId } },
      update: { stars, comment, isAnonymous: isAnonymous ?? false },
      create: { listingId, raterId, sellerId: listing.sellerId, stars, comment, isAnonymous: isAnonymous ?? false },
    });

    const rater = await this.prisma.user.findUnique({ where: { id: raterId } });
    const raterName = rater ? rater.username ?? rater.firstName : null;
    const publicRaterName = isAnonymous ? null : raterName;
    const title = "Yangi sharh ⭐";
    const body = publicRaterName
      ? `${publicRaterName} tomonidan "${listing.title}" eloningizga ${stars} yulduzli sharh qoldirildi.`
      : `"${listing.title}" eloningizga anonim ravishda ${stars} yulduzli sharh qoldirildi.`;
    await this.notificationsService.create(listing.sellerId, NotificationType.NEW_RATING, title, body, `/listings/${listingId}`);
    await this.botService.notifyNewRating(listing.seller.telegramId, listingId, listing.title, stars, publicRaterName);

    return rating;
  }

  async findMine(raterId: string, listingId: string) {
    return this.prisma.rating.findUnique({
      where: { listingId_raterId: { listingId, raterId } },
    });
  }

  async findForListing(listingId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { listingId },
      include: { rater: true },
      orderBy: { createdAt: "desc" },
    });

    return ratings.map((r) => ({
      id: r.id,
      stars: r.stars,
      comment: r.comment,
      createdAt: r.createdAt,
      raterName: r.isAnonymous ? null : (r.rater.username ?? r.rater.firstName),
      sellerReply: r.sellerReply,
      sellerRepliedAt: r.sellerRepliedAt,
    }));
  }

  async reply(ratingId: string, sellerId: string, reply: string) {
    const rating = await this.prisma.rating.findUnique({ where: { id: ratingId } });
    if (!rating) throw new NotFoundException("Sharh topilmadi");
    if (rating.sellerId !== sellerId) throw new ForbiddenException("Bu sizning eloningizga qoldirilgan sharh emas");

    return this.prisma.rating.update({
      where: { id: ratingId },
      data: { sellerReply: reply, sellerRepliedAt: new Date() },
    });
  }

  async getSellerSummary(sellerId: string) {
    const result = await this.prisma.rating.aggregate({
      where: { sellerId },
      _avg: { stars: true },
      _count: true,
    });
    const isVerified =
      result._count >= VERIFIED_SELLER_MIN_RATINGS && (result._avg.stars ?? 0) >= VERIFIED_SELLER_MIN_AVG;
    return { avg: result._avg.stars, count: result._count, isVerified };
  }
}
