import { Injectable, NotFoundException } from "@nestjs/common";
import { ReportStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, listingId: string, reason: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException("Elon topilmadi");

    return this.prisma.report.create({
      data: { listingId, reporterId, reason },
    });
  }

  async findPending() {
    return this.prisma.report.findMany({
      where: { status: ReportStatus.PENDING },
      include: {
        listing: { select: { id: true, title: true, status: true } },
        reporter: { select: { telegramId: true, username: true, firstName: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async resolve(id: string, status: typeof ReportStatus.RESOLVED | typeof ReportStatus.DISMISSED) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException("Shikoyat topilmadi");
    return this.prisma.report.update({ where: { id }, data: { status } });
  }
}
