import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Listing, NotificationType, SavedSearch } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BotService } from "../bot/bot.service";
import { CreateSavedSearchDto } from "./dto/create-saved-search.dto";

function matchesSearch(search: SavedSearch, listing: Listing): boolean {
  if (search.userId === listing.sellerId) return false;
  if (search.categoryId && search.categoryId !== listing.categoryId) return false;
  if (search.regionId && search.regionId !== listing.regionId) return false;
  if (search.districtId && search.districtId !== listing.districtId) return false;
  if (search.condition && search.condition !== listing.condition) return false;
  if (search.minPrice != null && (listing.price == null || listing.price < search.minPrice)) return false;
  if (search.maxPrice != null && (listing.price == null || listing.price > search.maxPrice)) return false;
  if (search.q) {
    const haystack = `${listing.title} ${listing.description}`.toLowerCase();
    if (!haystack.includes(search.q.toLowerCase())) return false;
  }
  return true;
}

@Injectable()
export class SavedSearchesService {
  private readonly logger = new Logger(SavedSearchesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly botService: BotService,
  ) {}

  create(userId: string, dto: CreateSavedSearchDto) {
    return this.prisma.savedSearch.create({ data: { ...dto, userId } });
  }

  findMine(userId: string) {
    return this.prisma.savedSearch.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }

  async remove(id: string, userId: string) {
    const search = await this.prisma.savedSearch.findUnique({ where: { id } });
    if (!search) throw new NotFoundException("Qidiruv topilmadi");
    if (search.userId !== userId) throw new ForbiddenException("Bu sizning qidiruvingiz emas");
    await this.prisma.savedSearch.delete({ where: { id } });
  }

  // Har bir yangi e'lon uchun alohida darhol xabar yuborish o'rniga, kuniga bir marta
  // barcha mos kelgan e'lonlarni bitta xabarga jamlab yuboradi.
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyDigest() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newListings = await this.prisma.listing.findMany({
      where: { status: "ACTIVE", createdAt: { gte: since } },
    });
    if (newListings.length === 0) return;

    const searches = await this.prisma.savedSearch.findMany({ include: { user: true } });
    const byUser = new Map<string, { telegramId: string; totalMatches: number; labels: string[] }>();

    for (const search of searches) {
      const matched = newListings.filter((listing) => matchesSearch(search, listing));
      if (matched.length === 0) continue;

      const entry = byUser.get(search.userId) ?? {
        telegramId: search.user.telegramId,
        totalMatches: 0,
        labels: [],
      };
      entry.totalMatches += matched.length;
      entry.labels.push(`"${search.label}" (${matched.length})`);
      byUser.set(search.userId, entry);
    }

    for (const [userId, entry] of byUser) {
      const body = `Saqlangan qidiruvlaringiz bo'yicha ${entry.totalMatches} ta yangi e'lon topildi: ${entry.labels.join(", ")}.`;
      await this.notificationsService.create(
        userId,
        NotificationType.SAVED_SEARCH_MATCH,
        "Yangi mos e'lonlar 🔔",
        body,
        "/saved-searches",
      );
      await this.botService.notifySavedSearchDigest(entry.telegramId, entry.totalMatches, entry.labels);
    }

    if (byUser.size > 0) {
      this.logger.log(`Kunlik digest yuborildi: ${byUser.size} foydalanuvchi`);
    }
  }
}
