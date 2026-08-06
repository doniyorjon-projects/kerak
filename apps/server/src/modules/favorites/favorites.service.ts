import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

const FEED_INCLUDE = {
  seller: { select: { telegramId: true, username: true, firstName: true } },
} as const;

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { listing: { include: FEED_INCLUDE } },
      orderBy: { createdAt: "desc" },
    });
    return favorites.map((f) => f.listing);
  }

  async checkStatus(userId: string, listingId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    return { isFavorite: Boolean(favorite) };
  }

  async add(userId: string, listingId: string) {
    await this.prisma.favorite.upsert({
      where: { userId_listingId: { userId, listingId } },
      update: {},
      create: { userId, listingId },
    });
    return { isFavorite: true };
  }

  async remove(userId: string, listingId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, listingId } });
    return { isFavorite: false };
  }
}
