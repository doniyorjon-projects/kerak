import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ContactEventType, ListingCondition, ListingStatus, NotificationType, Prisma, SellerType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { BotService } from "../bot/bot.service";
import { NotificationsService } from "../notifications/notifications.service";

const FEED_INCLUDE = {
  seller: { select: { id: true, telegramId: true, username: true, firstName: true } },
} as const;

const BUMP_COOLDOWN_HOURS = 24;

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
  condition?: ListingCondition;
  isFree?: boolean;
  isUrgent?: boolean;
  hasDelivery?: boolean;
  sellerType?: SellerType;
  attributes?: Record<string, string>;
  attributesAny?: Record<string, string>;
  attributesMin?: Record<string, string>;
  attributesMax?: Record<string, string>;
  limit?: number;
  offset?: number;
}

interface FeedRow {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  price: number | null;
  previousPrice: number | null;
  priceUsd: number | null;
  isNegotiable: boolean;
  isFree: boolean;
  isUrgent: boolean;
  hasDelivery: boolean;
  isBargainable: boolean;
  sellerType: SellerType | null;
  photos: string[];
  addressText: string | null;
  regionId: number | null;
  districtId: number | null;
  lat: number | null;
  lng: number | null;
  phone: string;
  condition: ListingCondition | null;
  status: ListingStatus;
  viewsCount: number;
  createdAt: Date;
  boostedUntil: Date | null;
  bumpedAt: Date | null;
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
    private readonly notificationsService: NotificationsService,
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
      data: {
        ...dto,
        ...(dto.isFree ? { price: null, priceUsd: null, isNegotiable: false } : {}),
        sellerId,
        status: ListingStatus.PENDING,
      },
      include: FEED_INCLUDE,
    });
    await this.botService.notifyAdminNewListing(listing);
    return listing;
  }

  /** Berilgan kategoriya id'si + uning barcha bola (istalgan chuqurlikdagi) id'larini qaytaradi. */
  private async resolveCategoryDescendantIds(categoryId: string): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE descendants AS (
        SELECT id FROM "Category" WHERE id = ${categoryId}
        UNION ALL
        SELECT c.id FROM "Category" c JOIN descendants d ON c."parentId" = d.id
      )
      SELECT id FROM descendants
    `;
    return rows.map((r) => r.id);
  }

  async findFeed(options: FindFeedOptions) {
    const {
      categoryId,
      lat,
      lng,
      radiusKm,
      sort,
      q,
      boostedOnly,
      regionId,
      districtId,
      minPrice,
      maxPrice,
      condition,
      isFree,
      isUrgent,
      hasDelivery,
      sellerType,
      attributes,
      attributesAny,
      attributesMin,
      attributesMax,
      limit,
      offset,
    } = options;
    const hasLocation = lat !== undefined && lng !== undefined;

    // Kategoriya endi 3 darajali - agar berilgan id "leaf" bo'lmasa (ya'ni
    // asosiy yoki subkategoriya bo'lsa), o'sha kategoriyaga bevosita e'lon
    // bog'lanmagan bo'ladi. Shuning uchun berilgan id + uning barcha bola
    // (descendant) id'lari bo'yicha filtrlaymiz.
    const categoryIds = categoryId ? await this.resolveCategoryDescendantIds(categoryId) : undefined;

    if (!hasLocation) {
      const orderBy: Prisma.ListingOrderByWithRelationInput[] =
        sort === "price_asc"
          ? [{ price: "asc" }]
          : sort === "price_desc"
            ? [{ price: "desc" }]
            : [{ bumpedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];

      const now = new Date();

      const attributeConditions: Prisma.ListingWhereInput[] = [
        ...Object.entries(attributes ?? {}).map(
          ([key, value]): Prisma.ListingWhereInput => ({ attributes: { path: [key], equals: value } }),
        ),
        ...Object.entries(attributesAny ?? {}).map(
          ([key, value]): Prisma.ListingWhereInput => ({ attributes: { path: [key], array_contains: value } }),
        ),
        ...Object.entries(attributesMin ?? {})
          .filter(([, value]) => Number.isFinite(Number(value)))
          .map(([key, value]): Prisma.ListingWhereInput => ({ attributes: { path: [key], gte: Number(value) } })),
        ...Object.entries(attributesMax ?? {})
          .filter(([, value]) => Number.isFinite(Number(value)))
          .map(([key, value]): Prisma.ListingWhereInput => ({ attributes: { path: [key], lte: Number(value) } })),
      ];

      const baseWhere: Prisma.ListingWhereInput = {
        status: ListingStatus.ACTIVE,
        ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
        ...(regionId ? { regionId } : {}),
        ...(districtId ? { districtId } : {}),
        ...(condition ? { condition } : {}),
        ...((minPrice !== undefined || maxPrice !== undefined)
          ? { price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }
          : {}),
        ...(isFree ? { isFree: true } : {}),
        ...(isUrgent ? { isUrgent: true } : {}),
        ...(hasDelivery ? { hasDelivery: true } : {}),
        ...(sellerType ? { sellerType } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(attributeConditions.length > 0 ? { AND: attributeConditions } : {}),
      };

      if (boostedOnly) {
        const boosted = await this.prisma.listing.findMany({
          where: { ...baseWhere, boostedUntil: { gt: now } },
          include: FEED_INCLUDE,
          orderBy,
        });
        return boosted.map((l) => ({ ...l, distanceKm: null as number | null }));
      }

      // Ko'tarilgan e'lonlar har bir sahifada to'liq qaytariladi (kichik
      // to'plam) - frontend ularni id bo'yicha birlashtirib, takrorlarni
      // o'zi olib tashlaydi. "offset"/"limit" faqat oddiy e'lonlarga
      // tegishli.
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
          skip: offset ?? 0,
          take: limit,
        }),
      ]);

      return [...boosted, ...normal].map((l) => ({ ...l, distanceKm: null as number | null }));
    }

    const conditions = [
      Prisma.sql`l.status = 'ACTIVE'::"ListingStatus"`,
      Prisma.sql`l.lat IS NOT NULL`,
      Prisma.sql`l.lng IS NOT NULL`,
    ];
    if (categoryIds) conditions.push(Prisma.sql`l."categoryId" = ANY(${categoryIds})`);
    if (regionId) conditions.push(Prisma.sql`l."regionId" = ${regionId}`);
    if (districtId) conditions.push(Prisma.sql`l."districtId" = ${districtId}`);
    if (condition) conditions.push(Prisma.sql`l.condition = ${condition}::"ListingCondition"`);
    if (minPrice !== undefined) conditions.push(Prisma.sql`l.price >= ${minPrice}`);
    if (maxPrice !== undefined) conditions.push(Prisma.sql`l.price <= ${maxPrice}`);
    if (isFree) conditions.push(Prisma.sql`l."isFree" = true`);
    if (isUrgent) conditions.push(Prisma.sql`l."isUrgent" = true`);
    if (hasDelivery) conditions.push(Prisma.sql`l."hasDelivery" = true`);
    if (sellerType) conditions.push(Prisma.sql`l."sellerType" = ${sellerType}::"SellerType"`);
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(Prisma.sql`(l.title ILIKE ${pattern} OR l.description ILIKE ${pattern})`);
    }
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        conditions.push(Prisma.sql`l.attributes ->> ${key} = ${value}`);
      }
    }
    if (attributesAny) {
      for (const [key, value] of Object.entries(attributesAny)) {
        conditions.push(Prisma.sql`l.attributes -> ${key} @> to_jsonb(${value}::text)`);
      }
    }
    if (attributesMin) {
      for (const [key, value] of Object.entries(attributesMin)) {
        const num = Number(value);
        if (Number.isFinite(num)) conditions.push(Prisma.sql`(l.attributes ->> ${key})::numeric >= ${num}`);
      }
    }
    if (attributesMax) {
      for (const [key, value] of Object.entries(attributesMax)) {
        const num = Number(value);
        if (Number.isFinite(num)) conditions.push(Prisma.sql`(l.attributes ->> ${key})::numeric <= ${num}`);
      }
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
            ? Prisma.sql`GREATEST(l."bumpedAt", l."createdAt") DESC`
            : Prisma.sql`"distanceKm" ASC`;

    const selectFrom = Prisma.sql`
      SELECT
        l.id, l."categoryId" as "categoryId", l.title, l.description, l.price,
        l."previousPrice" as "previousPrice", l."priceUsd" as "priceUsd",
        l."isNegotiable" as "isNegotiable", l."isFree" as "isFree", l."isUrgent" as "isUrgent",
        l."hasDelivery" as "hasDelivery", l."isBargainable" as "isBargainable", l."sellerType" as "sellerType",
        l.photos, l."addressText" as "addressText",
        l."regionId" as "regionId", l."districtId" as "districtId",
        l.lat, l.lng, l.phone, l.condition, l.status, l."viewsCount" as "viewsCount", l."createdAt" as "createdAt",
        l."boostedUntil" as "boostedUntil", l."bumpedAt" as "bumpedAt",
        u.id as "sellerId", u."telegramId" as "sellerTelegramId", u.username as "sellerUsername", u."firstName" as "sellerFirstName",
        ST_Distance(
          ST_SetSRID(ST_MakePoint(l.lng, l.lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) / 1000.0 as "distanceKm"
      FROM "Listing" l
      JOIN "User" u ON u.id = l."sellerId"
    `;

    // Ko'tarilgan e'lonlar har bir sahifada to'liq qaytariladi (kichik
    // to'plam) - frontend ularni id bo'yicha birlashtirib, takrorlarni o'zi
    // olib tashlaydi. "offset"/"limit" faqat oddiy e'lonlarga tegishli.
    const boostedCondition = Prisma.sql`l."boostedUntil" IS NOT NULL AND l."boostedUntil" > NOW()`;
    const normalCondition = boostedOnly
      ? boostedCondition
      : Prisma.sql`(l."boostedUntil" IS NULL OR l."boostedUntil" <= NOW())`;

    const [boostedRows, normalRows] = await Promise.all([
      boostedOnly
        ? Promise.resolve([])
        : this.prisma.$queryRaw<FeedRow[]>`
            ${selectFrom}
            WHERE ${Prisma.join([...conditions, boostedCondition], " AND ")}
            ORDER BY ${secondaryOrderClause}
          `,
      this.prisma.$queryRaw<FeedRow[]>`
        ${selectFrom}
        WHERE ${Prisma.join([...conditions, normalCondition], " AND ")}
        ORDER BY ${secondaryOrderClause}
        LIMIT ${limit ?? 1000000}
        OFFSET ${offset ?? 0}
      `,
    ]);

    const rows = [...boostedRows, ...normalRows];

    return rows.map((r) => ({
      id: r.id,
      categoryId: r.categoryId,
      title: r.title,
      description: r.description,
      price: r.price,
      previousPrice: r.previousPrice,
      priceUsd: r.priceUsd,
      isNegotiable: r.isNegotiable,
      isFree: r.isFree,
      isUrgent: r.isUrgent,
      hasDelivery: r.hasDelivery,
      isBargainable: r.isBargainable,
      sellerType: r.sellerType,
      photos: r.photos,
      addressText: r.addressText,
      regionId: r.regionId,
      districtId: r.districtId,
      lat: r.lat,
      lng: r.lng,
      phone: r.phone,
      condition: r.condition,
      status: r.status,
      viewsCount: r.viewsCount,
      createdAt: r.createdAt,
      boostedUntil: r.boostedUntil,
      bumpedAt: r.bumpedAt,
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

  async findOne(id: string, viewerId?: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id }, include: FEED_INCLUDE });
    if (!listing) throw new NotFoundException("Elon topilmadi");

    if (viewerId && viewerId !== listing.sellerId && listing.status === ListingStatus.ACTIVE) {
      const { count } = await this.prisma.listingView.createMany({
        data: [{ listingId: id, viewerId }],
        skipDuplicates: true,
      });
      if (count > 0) {
        await this.prisma.listing.update({ where: { id }, data: { viewsCount: { increment: 1 } } });
        listing.viewsCount += 1;
      }
    }

    return listing;
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];
    const listings = await this.prisma.listing.findMany({
      where: { id: { in: ids }, status: ListingStatus.ACTIVE },
      include: FEED_INCLUDE,
    });
    const byId = new Map(listings.map((l) => [l.id, l]));
    return ids.map((id) => byId.get(id)).filter((l): l is NonNullable<typeof l> => l != null);
  }

  async getPriceHistory(id: string) {
    return this.prisma.priceHistory.findMany({
      where: { listingId: id },
      orderBy: { createdAt: "asc" },
      select: { price: true, createdAt: true },
    });
  }

  async findSimilar(id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Elon topilmadi");

    return this.prisma.listing.findMany({
      where: {
        categoryId: listing.categoryId,
        status: ListingStatus.ACTIVE,
        id: { not: id },
      },
      include: FEED_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  }

  async update(id: string, sellerId: string, dto: UpdateListingDto, isAdmin = false) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== sellerId && !isAdmin) throw new ForbiddenException("Bu sizning eloningiz emas");

    const { status, ...content } = dto;
    const hasContentChanges = Object.values(content).some((value) => value !== undefined);
    const priceDropped =
      content.price !== undefined && content.price != null && listing.price != null && content.price < listing.price;
    const priceRaised =
      content.price !== undefined && content.price != null && listing.price != null && content.price > listing.price;

    const data: Prisma.ListingUpdateInput = { ...content };
    if (content.isFree) {
      data.price = null;
      data.priceUsd = null;
      data.isNegotiable = false;
    }
    if (priceDropped) {
      data.previousPrice = listing.price;
    } else if (priceRaised) {
      data.previousPrice = null;
    }
    if (status) {
      data.status = status;
    } else if (hasContentChanges && listing.status === ListingStatus.REJECTED) {
      data.status = ListingStatus.PENDING;
    }

    const updated = await this.prisma.listing.update({ where: { id }, data, include: FEED_INCLUDE });

    if (content.price !== undefined && content.price !== listing.price) {
      await this.prisma.priceHistory.create({ data: { listingId: id, price: listing.price } });
    }

    if (data.status === ListingStatus.PENDING) {
      await this.botService.notifyAdminNewListing(updated);
    }

    if (priceDropped && updated.status === ListingStatus.ACTIVE) {
      await this.notifyPriceDrop(updated, listing.price!, content.price!);
    }

    return updated;
  }

  private async notifyPriceDrop(listing: { id: string; title: string; sellerId: string }, oldPrice: number, newPrice: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: { listingId: listing.id, userId: { not: listing.sellerId } },
      include: { user: true },
    });

    for (const fav of favorites) {
      await this.notificationsService.create(
        fav.userId,
        NotificationType.PRICE_DROP,
        "Narx tushdi 📉",
        `"${listing.title}" — sevimlilaringizdagi e'lon narxi ${oldPrice.toLocaleString("uz-UZ")} so'mdan ${newPrice.toLocaleString("uz-UZ")} so'mga tushdi.`,
        `/listings/${listing.id}`,
      );
      await this.botService.notifyPriceDrop(fav.user.telegramId, listing.id, listing.title, oldPrice, newPrice);
    }
  }

  async bump(id: string, sellerId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== sellerId) throw new ForbiddenException("Bu sizning eloningiz emas");
    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException("Faqat faol e'lonlarni yuqoriga ko'tarish mumkin");
    }

    if (listing.bumpedAt) {
      const cooldownEnds = new Date(listing.bumpedAt.getTime() + BUMP_COOLDOWN_HOURS * 60 * 60 * 1000);
      if (cooldownEnds > new Date()) {
        throw new BadRequestException(
          `Bu e'lonni faqat ${BUMP_COOLDOWN_HOURS} soatda bir marta bepul ko'tarish mumkin`,
        );
      }
    }

    return this.prisma.listing.update({
      where: { id },
      data: { bumpedAt: new Date() },
      include: FEED_INCLUDE,
    });
  }

  async remove(id: string, sellerId: string, isAdmin = false) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== sellerId && !isAdmin) throw new ForbiddenException("Bu sizning eloningiz emas");
    await this.prisma.listing.delete({ where: { id } });
  }

  async logContactEvent(listingId: string, fromUserId: string, type: ContactEventType) {
    await this.prisma.listing.findUniqueOrThrow({ where: { id: listingId } });
    return this.prisma.contactEvent.create({ data: { listingId, fromUserId, type } });
  }

  async getStats(id: string, sellerId: string, isAdmin = false) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId !== sellerId && !isAdmin) throw new ForbiddenException("Bu sizning eloningiz emas");

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
