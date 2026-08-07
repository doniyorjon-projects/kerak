import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Listing, NotificationType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateSavedSearchDto } from "./dto/create-saved-search.dto";

@Injectable()
export class SavedSearchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
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

  async notifyMatches(listing: Listing) {
    const searches = await this.prisma.savedSearch.findMany();
    const haystack = `${listing.title} ${listing.description}`.toLowerCase();

    for (const s of searches) {
      if (s.userId === listing.sellerId) continue;
      if (s.categoryId && s.categoryId !== listing.categoryId) continue;
      if (s.regionId && s.regionId !== listing.regionId) continue;
      if (s.districtId && s.districtId !== listing.districtId) continue;
      if (s.condition && s.condition !== listing.condition) continue;
      if (s.minPrice != null && (listing.price == null || listing.price < s.minPrice)) continue;
      if (s.maxPrice != null && (listing.price == null || listing.price > s.maxPrice)) continue;
      if (s.q && !haystack.includes(s.q.toLowerCase())) continue;

      await this.notificationsService.create(
        s.userId,
        NotificationType.SAVED_SEARCH_MATCH,
        "Yangi mos e'lon! 🔔",
        `"${listing.title}" — "${s.label}" qidiruvingizga mos e'lon topildi.`,
        `/listings/${listing.id}`,
      );
    }
  }
}
