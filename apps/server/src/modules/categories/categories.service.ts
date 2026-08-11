import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ListingStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
      include: { _count: { select: { listings: { where: { status: ListingStatus.ACTIVE } } } } },
    });
    return categories.map(({ _count, ...category }) => ({
      ...category,
      listingsCount: _count.listings,
    }));
  }

  async create(dto: CreateCategoryDto) {
    let level = 1;
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException("Ota toifa topilmadi");
      level = parent.level + 1;
    }
    const existing = await this.prisma.category.findUnique({ where: { id: dto.id } });
    if (existing) throw new BadRequestException("Shu id bilan toifa allaqachon mavjud");
    return this.prisma.category.create({ data: { ...dto, level } });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Toifa topilmadi");

    let level: number | undefined;
    if (dto.parentId !== undefined && dto.parentId !== category.parentId) {
      if (dto.parentId === id) throw new BadRequestException("Toifa o'zining ota toifasi bo'la olmaydi");
      if (dto.parentId) {
        const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
        if (!parent) throw new NotFoundException("Ota toifa topilmadi");
        level = parent.level + 1;
      } else {
        level = 1;
      }
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: level !== undefined ? { ...dto, level } : dto,
    });

    if (level !== undefined) {
      await this.updateDescendantLevels(id, level);
    }
    return updated;
  }

  private async updateDescendantLevels(parentId: string, parentLevel: number) {
    const children = await this.prisma.category.findMany({ where: { parentId }, select: { id: true } });
    for (const child of children) {
      const childLevel = parentLevel + 1;
      await this.prisma.category.update({ where: { id: child.id }, data: { level: childLevel } });
      await this.updateDescendantLevels(child.id, childLevel);
    }
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Toifa topilmadi");

    const [childrenCount, listingsCount] = await Promise.all([
      this.prisma.category.count({ where: { parentId: id } }),
      this.prisma.listing.count({ where: { categoryId: id } }),
    ]);
    if (childrenCount > 0) {
      throw new BadRequestException("Avval ichidagi subtoifalarni o'chiring");
    }
    if (listingsCount > 0) {
      throw new BadRequestException("Bu toifada e'lonlar mavjud, o'chirib bo'lmaydi");
    }

    await this.prisma.category.delete({ where: { id } });
  }
}
