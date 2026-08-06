import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ListingStatus, ReportStatus } from "@prisma/client";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { AdminGuard } from "../../common/admin.guard";
import { PrismaService } from "../../prisma/prisma.service";
import { ReportsService } from "../reports/reports.service";
import { BannersService } from "../banners/banners.service";
import { CreateBannerDto } from "../banners/dto/create-banner.dto";
import { UpdateBannerDto } from "../banners/dto/update-banner.dto";

@Controller("admin")
@UseGuards(TelegramAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
    private readonly bannersService: BannersService,
  ) {}

  @Get("listings/pending")
  findPending() {
    return this.prisma.listing.findMany({
      where: { status: ListingStatus.PENDING },
      include: { seller: true, category: true },
      orderBy: { createdAt: "asc" },
    });
  }

  @Patch("listings/:id/approve")
  approve(@Param("id") id: string) {
    return this.prisma.listing.update({ where: { id }, data: { status: ListingStatus.ACTIVE } });
  }

  @Patch("listings/:id/reject")
  reject(@Param("id") id: string) {
    return this.prisma.listing.update({ where: { id }, data: { status: ListingStatus.REJECTED } });
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
}
