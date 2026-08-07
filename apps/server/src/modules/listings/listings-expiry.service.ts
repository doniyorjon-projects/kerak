import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ListingStatus, NotificationType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { BotService } from "../bot/bot.service";
import { NotificationsService } from "../notifications/notifications.service";

const INACTIVITY_DAYS = 30;

@Injectable()
export class ListingsExpiryService {
  private readonly logger = new Logger(ListingsExpiryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async pauseInactiveListings() {
    const threshold = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
    const stale = await this.prisma.listing.findMany({
      where: { status: ListingStatus.ACTIVE, updatedAt: { lt: threshold } },
      include: { seller: true },
    });

    for (const listing of stale) {
      await this.prisma.listing.update({ where: { id: listing.id }, data: { status: ListingStatus.PAUSED } });
      await this.botService.notifyListingExpired(listing.seller.telegramId, listing.id, listing.title);
      await this.notificationsService.create(
        listing.sellerId,
        NotificationType.LISTING_EXPIRED,
        "Elon pauza qilindi ⏸",
        `"${listing.title}" eloningiz 30 kun faolsizlik sababli avtomatik pauza qilindi.`,
        `/listings/${listing.id}`,
      );
    }

    if (stale.length > 0) {
      this.logger.log(`${stale.length} ta faolsiz elon pauza qilindi`);
    }
  }
}
