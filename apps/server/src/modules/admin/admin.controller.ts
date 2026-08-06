import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ListingStatus, ReportStatus } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { AdminGuard } from "../../common/admin.guard";
import { CurrentUser } from "../../common/current-user.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import { ReportsService } from "../reports/reports.service";
import { BannersService } from "../banners/banners.service";
import { CreateBannerDto } from "../banners/dto/create-banner.dto";
import { UpdateBannerDto } from "../banners/dto/update-banner.dto";
import { CategoriesService } from "../categories/categories.service";
import { CreateCategoryDto } from "../categories/dto/create-category.dto";
import { UpdateCategoryDto } from "../categories/dto/update-category.dto";
import { PricingService } from "../pricing/pricing.service";
import { UpdatePricingDto } from "../pricing/dto/update-pricing.dto";
import { BotService } from "../bot/bot.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AddAdminDto } from "./dto/add-admin.dto";
import { RejectListingDto } from "./dto/reject-listing.dto";
import type { User } from "@prisma/client";
import { NotificationType } from "@prisma/client";

@Controller("admin")
@UseGuards(TelegramAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
    private readonly bannersService: BannersService,
    private readonly categoriesService: CategoriesService,
    private readonly pricingService: PricingService,
    private readonly botService: BotService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Patch("pricing")
  updatePricing(@Body() dto: UpdatePricingDto) {
    return this.pricingService.update(dto);
  }

  @Get("listings/pending")
  findPending() {
    return this.prisma.listing.findMany({
      where: { status: ListingStatus.PENDING },
      include: { seller: true, category: true },
      orderBy: { createdAt: "asc" },
    });
  }

  @Get("users")
  async findUsers() {
    const users = await this.prisma.user.findMany({
      include: { _count: { select: { listings: true, reports: true } } },
      orderBy: { createdAt: "desc" },
    });
    const ratings = await this.prisma.rating.groupBy({
      by: ["sellerId"],
      _avg: { stars: true },
      _count: true,
    });
    const ratingMap = new Map(ratings.map((r) => [r.sellerId, { avg: r._avg.stars, count: r._count }]));

    return users.map((u) => ({
      id: u.id,
      telegramId: u.telegramId,
      username: u.username,
      firstName: u.firstName,
      phone: u.phone,
      isAdmin: u.isAdmin,
      isBlocked: u.isBlocked,
      listingsLimit: u.listingsLimit,
      createdAt: u.createdAt,
      listingsCount: u._count.listings,
      reportsFiledCount: u._count.reports,
      rating: ratingMap.get(u.id) ?? { avg: null, count: 0 },
    }));
  }

  @Get("users/:id/listings")
  findUserListings(@Param("id") id: string) {
    return this.prisma.listing.findMany({
      where: { sellerId: id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  @Patch("users/:id/block")
  async blockUser(@Param("id") id: string, @CurrentUser() currentUser: User) {
    if (id === currentUser.id) {
      throw new BadRequestException("O'zingizni bloklay olmaysiz");
    }
    return this.prisma.user.update({ where: { id }, data: { isBlocked: true } });
  }

  @Patch("users/:id/unblock")
  unblockUser(@Param("id") id: string) {
    return this.prisma.user.update({ where: { id }, data: { isBlocked: false } });
  }

  @Patch("listings/:id/approve")
  async approve(@Param("id") id: string) {
    const listing = await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.ACTIVE },
      include: { seller: true },
    });

    await this.botService.notifySellerModerationResult(listing.seller.telegramId, listing.id, listing.title, true);
    await this.notificationsService.create(
      listing.sellerId,
      NotificationType.LISTING_APPROVED,
      "Elon tasdiqlandi ✅",
      `"${listing.title}" eloningiz tasdiqlandi va endi katalogda ko'rinadi.`,
      `/listings/${listing.id}`,
    );

    return listing;
  }

  @Patch("listings/:id/reject")
  async reject(@Param("id") id: string, @Body() dto: RejectListingDto) {
    const listing = await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.REJECTED, rejectionReason: dto.reason ?? null },
      include: { seller: true },
    });

    await this.botService.notifySellerModerationResult(
      listing.seller.telegramId,
      listing.id,
      listing.title,
      false,
      dto.reason,
    );
    await this.notificationsService.create(
      listing.sellerId,
      NotificationType.LISTING_REJECTED,
      "Elon rad etildi ❌",
      dto.reason
        ? `"${listing.title}" eloningiz rad etildi. Sabab: ${dto.reason}`
        : `"${listing.title}" eloningiz rad etildi.`,
      `/listings/${listing.id}`,
    );

    return listing;
  }

  @Get("reports")
  findPendingReports() {
    return this.reportsService.findPending();
  }

  @Patch("reports/:id/resolve")
  resolveReport(@Param("id") id: string) {
    return this.reportsService.resolve(id, ReportStatus.RESOLVED);
  }

  @Patch("reports/:id/dismiss")
  dismissReport(@Param("id") id: string) {
    return this.reportsService.resolve(id, ReportStatus.DISMISSED);
  }

  @Get("banners")
  findAllBanners() {
    return this.bannersService.findAll();
  }

  @Post("banners")
  createBanner(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Patch("banners/:id")
  updateBanner(@Param("id") id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete("banners/:id")
  removeBanner(@Param("id") id: string) {
    return this.bannersService.remove(id);
  }

  @Post("categories")
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch("categories/:id")
  updateCategory(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete("categories/:id")
  removeCategory(@Param("id") id: string) {
    return this.categoriesService.remove(id);
  }

  @Get("admins")
  findAdmins() {
    return this.prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true, telegramId: true, username: true, firstName: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  }

  @Post("admins")
  async addAdmin(@Body() dto: AddAdminDto) {
    const identifier = dto.identifier.trim().replace(/^@/, "");
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ telegramId: identifier }, { username: identifier }] },
    });
    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi. U botni kamida bir marta ishga tushirgan bo'lishi kerak");
    }
    return this.prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
  }

  @Delete("admins/:id")
  async removeAdmin(@Param("id") id: string, @CurrentUser() currentUser: User) {
    if (id === currentUser.id) {
      throw new BadRequestException("O'zingizni admindan chiqara olmaysiz");
    }
    const adminCount = await this.prisma.user.count({ where: { isAdmin: true } });
    if (adminCount <= 1) {
      throw new BadRequestException("Oxirgi adminni o'chirib bo'lmaydi");
    }
    await this.prisma.user.update({ where: { id }, data: { isAdmin: false } });
  }

  @Get("stats")
  async getStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      totalListings,
      listingsByStatus,
      newListingsToday,
      newListingsThisWeek,
      totalCategories,
      reportsByStatus,
      boostStats,
      totalFavorites,
      totalMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.listing.count(),
      this.prisma.listing.groupBy({ by: ["status"], _count: true }),
      this.prisma.listing.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.listing.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.category.count(),
      this.prisma.report.groupBy({ by: ["status"], _count: true }),
      this.prisma.boostOrder.aggregate({
        where: { status: "PAID" },
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.favorite.count(),
      this.prisma.message.count(),
    ]);

    const listingStatusMap: Record<string, number> = {};
    for (const row of listingsByStatus) listingStatusMap[row.status] = row._count;

    const reportStatusMap: Record<string, number> = {};
    for (const row of reportsByStatus) reportStatusMap[row.status] = row._count;

    return {
      users: { total: totalUsers, newToday: newUsersToday, newThisWeek: newUsersThisWeek },
      listings: {
        total: totalListings,
        pending: listingStatusMap.PENDING ?? 0,
        active: listingStatusMap.ACTIVE ?? 0,
        paused: listingStatusMap.PAUSED ?? 0,
        sold: listingStatusMap.SOLD ?? 0,
        rejected: listingStatusMap.REJECTED ?? 0,
        newToday: newListingsToday,
        newThisWeek: newListingsThisWeek,
      },
      categories: { total: totalCategories },
      reports: {
        pending: reportStatusMap.PENDING ?? 0,
        resolved: reportStatusMap.RESOLVED ?? 0,
        dismissed: reportStatusMap.DISMISSED ?? 0,
      },
      boosts: { paidCount: boostStats._count, totalRevenue: boostStats._sum.amount ?? 0 },
      favorites: totalFavorites,
      messages: totalMessages,
    };
  }
}
