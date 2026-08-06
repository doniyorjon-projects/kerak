import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ContactEventType, ListingStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { BotService } from "../bot/bot.service";

const FEED_INCLUDE = {
  seller: { select: { id: true, telegramId: true, username: true, firstName: true } },
} as const;

export type FeedSort = "distance" | "newest" | "price_asc" | "price_desc";

export interface FindFeedOptions {
  categoryId?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: FeedSort;
  q?: string;
  boostedOnly?: boolean;
  regionId?: number;
  districtId?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface FeedRow {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
  photos: string[];
  addressText: string | null;
  regionId: number | null;
  districtId: number | null;
  lat: number | null;
  lng: number | null;
  phone: string;
  status: ListingStatus;
  viewsCount: number;
  createdAt: Date;
  boostedUntil: Date | null;
  sellerId: string;
  sellerTelegramId: string;
  sellerUsername: string | null;
  sellerFirstName: string;
  distanceKm: number;
}

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
  ) {}

  async create(sellerId: string, dto: CreateListingDto) {
    const seller = await this.prisma.user.findUniqueOrThrow({ where: { id: sellerId } });
    const activeCount = await this.prisma.listing.count({
      where: { sellerId, status: { in: [ListingStatus.PENDING, ListingStatus.ACTIVE, ListingStatus.PAUSED] } },
    });
    if (activeCount >= seller.listingsLimit) {
      throw new ForbiddenException(
        `Sizda ${seller.listingsLimit} tagacha faol e'lon joylash imkoni bor. Ko'proq joylash uchun tarifni oshiring.`,
      );
    }

    const listing = await this.prisma.listing.create({
      data: { ...dto, sellerId, status: ListingStatus.PENDING },
      include: FEED_INCLUDE,
    });
    await this.botService.notifyAdminNewListing(listing);
    return listing;
  }

  async findFeed(options: FindFeedOptions) {
    const { categoryId, lat, lng, radiusKm, sort, q, boostedOnly, regionId, districtId, minPrice, maxPrice } =
      options;
    const hasLocation = lat !== undefined && lng !== undefined;

    if (!hasLocation) {
      const orderBy: Prisma.ListingOrderByWithRelationInput =
        sort === "price_asc"
          ? { price: "asc" }
          : sort === "price_desc"
            ? { price: "desc" }
            : { createdAt: "desc" };

      const now = new Date();
      const baseWhere: Prisma.ListingWhereInput = {
        status: ListingStatus.ACTIVE,
        ...(categoryId ? { categoryId } : {}),
        ...(regionId ? { regionId } : {}),
        ...(districtId ? { districtId } : {}),
        ...((minPrice !== undefined || maxPrice !== undefined)
          ? { price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }
          : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      if (boostedOnly) {
        const boosted = await this.prisma.listing.findMany({
          where: { ...baseWhere, boostedUntil: { gt: now } },
          include: FEED_INCLUDE,
          orderBy,
        });
        return boosted.map((l) => ({ ...l, distanceKm: null as number | null }));
      }

      const [boosted, normal] = await Promise.all([
        this.prisma.listing.findMany({
          where: { ...baseWhere, boostedUntil: { gt: now } },
          include: FEED_INCLUDE,
          orderBy,
        }),
        this.prisma.listing.findMany({
          where: { ...baseWhere, OR: [{ boostedUntil: null }, { boostedUntil: { lte: now } }] },
          include: FEED_INCLUDE,
          orderBy,
        }),
      ]);

      return [...boosted, ...normal].map((l) => ({ ...l, distanceKm: null as number | null }));
    }

    const conditions = [
      Prisma.sql`l.status = 'ACTIVE'::"ListingStatus"`,
      Prisma.sql`l.lat IS NOT NULL`,
      Prisma.sql`l.lng IS NOT NULL`,
    ];
    if (categoryId) conditions.push(Prisma.sql`l."categoryId" = ${categoryId}`);
    if (regionId) conditions.push(Prisma.sql`l."regionId" = ${regionId}`);
    if (districtId) conditions.push(Prisma.sql`l."districtId" = ${districtId}`);
    if (minPrice !== undefined) conditions.push(Prisma.sql`l.price >= ${minPrice}`);
    if (maxPrice !== undefined) conditions.push(Prisma.sql`l.price <= ${maxPrice}`);
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(Prisma.sql`(l.title ILIKE ${pattern} OR l.description ILIKE ${pattern})`);
    }
    if (boostedOnly) {
      conditions.push(Prisma.sql`l."boostedUntil" IS NOT NULL AND l."boostedUntil" > NOW()`);
    }
    if (radiusKm) {
      conditions.push(Prisma.sql`
        ST_DWithin(
          ST_SetSRID(ST_MakePoint(l.lng, l.lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusKm * 1000}
        )
      `);
    }

    const secondaryOrderClause =
      sort === "price_asc"
        ? Prisma.sql`l.price ASC NULLS LAST`
        : sort === "price_desc"
          ? Prisma.sql`l.price DESC NULLS LAST`
          : sort === "newest"
            ? Prisma.sql`l."createdAt" DESC`
            : Prisma.sql`"distanceKm" ASC`;

    const rows = await this.prisma.$queryRaw<FeedRow[]>`
      SELECT
        l.id, l."categoryId" as "categoryId", l.title, l.description, l.price,
        l."isNegotiable" as "isNegotiable", l.photos, l."addressText" as "addressText",
        l."regionId" as "regionId", l."districtId" as "districtId",
        l.lat, l.lng, l.phone, l.status, l."viewsCount" as "viewsCount", l."createdAt" as "createdAt",
        l."boostedUntil" as "boostedUntil",
        u.id as "sellerId", u."telegramId" as "sellerTelegramId", u.username as "sellerUsername", u."firstName" as "sellerFirstName",
        ST_Distance(
          ST_SetSRID(ST_MakePoint(l.lng, l.lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) / 1000.0 as "distanceKm"
      FROM "Listing" l
      JOIN "User" u ON u.id = l."sellerId"
      WHERE ${Prisma.join(conditions, " AND ")}
      ORDER BY (l."boostedUntil" IS NOT NULL AND l."boostedUntil" > NOW()) DESC, ${secondaryOrderClause}
    `;

    return rows.map((r) => ({
      id: r.id,
      categoryId: r.categoryId,
      title: r.title,
      description: r.description,
      price: r.price,
      isNegotiable: r.isNegotiable,
      photos: r.photos,
      addressText: r.addressText,
      regionId: r.regionId,
      districtId: r.districtId,
      lat: r.lat,
      lng: r.lng,
      phone: r.phone,
      status: r.status,
      viewsCount: r.viewsCount,
      createdAt: r.createdAt,
      boostedUntil: r.boostedUntil,
      distanceKm: r.distanceKm,
      seller: {
        id: r.sellerId,
        telegramId: r.sellerTelegramId,
        username: r.sellerUsername,
        firstName: r.sellerFirstName,
      },
    }));
  }

  async findMine(sellerId: string) {
    return this.prisma.listing.findMany({
      where: { sellerId },
      include: FEED_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id }, include: FEED_INCLUDE });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    await this.prisma.listing.update({ where: { id }, data: { viewsCount: { increment: 1 } } });
    return listing;
  }

  async update(id: string, sellerId: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== sellerId) throw new ForbiddenException("Bu sizning eloningiz emas");

    const { status, ...content } = dto;
    const hasContentChanges = Object.values(content).some((value) => value !== undefined);

    const data: Prisma.ListingUpdateInput = { ...content };
    if (status) {
      data.status = status;
    } else if (hasContentChanges && listing.status === ListingStatus.REJECTED) {
      data.status = ListingStatus.PENDING;
    }

    const updated = await this.prisma.listing.update({ where: { id }, data, include: FEED_INCLUDE });

    if (data.status === ListingStatus.PENDING) {
      await this.botService.notifyAdminNewListing(updated);
    }

    return updated;
  }

  async remove(id: string, sellerId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== sellerId) throw new ForbiddenException("Bu sizning eloningiz emas");
    await this.prisma.listing.delete({ where: { id } });
  }

  async logContactEvent(listingId: string, fromUserId: string, type: ContactEventType) {
    await this.prisma.listing.findUniqueOrThrow({ where: { id: listingId } });
    return this.prisma.contactEvent.create({ data: { listingId, fromUserId, type } });
  }

  async getStats(id: string, sellerId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== sellerId) throw new ForbiddenException("Bu sizning eloningiz emas");

    const [telegramClicks, phoneClicks, favoritesCount, messagesCount] = await Promise.all([
      this.prisma.contactEvent.count({ where: { listingId: id, type: ContactEventType.TELEGRAM_CLICK } }),
      this.prisma.contactEvent.count({ where: { listingId: id, type: ContactEventType.PHONE_CLICK } }),
      this.prisma.favorite.count({ where: { listingId: id } }),
      this.prisma.message.count({ where: { listingId: id } }),
    ]);

    return {
      viewsCount: listing.viewsCount,
      telegramClicks,
      phoneClicks,
      favoritesCount,
      messagesCount,
    };
  }
}
