import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto });
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException("Banner topilmadi");
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException("Banner topilmadi");
    await this.prisma.banner.delete({ where: { id } });
  }
}
