import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(raterId: string, listingId: string, stars: number, comment?: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId === raterId) {
      throw new BadRequestException("O'zingizni baholay olmaysiz");
    }

    return this.prisma.rating.upsert({
      where: { listingId_raterId: { listingId, raterId } },
      update: { stars, comment },
      create: { listingId, raterId, sellerId: listing.sellerId, stars, comment },
    });
  }

  async findMine(raterId: string, listingId: string) {
    return this.prisma.rating.findUnique({
      where: { listingId_raterId: { listingId, raterId } },
    });
  }

  async getSellerSummary(sellerId: string) {
    const result = await this.prisma.rating.aggregate({
      where: { sellerId },
      _avg: { stars: true },
      _count: true,
    });
    return { avg: result._avg.stars, count: result._count };
  }
}
