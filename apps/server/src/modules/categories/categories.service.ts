import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    });
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException("Ota toifa topilmadi");
    }
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Toifa topilmadi");
    return this.prisma.category.update({ where: { id }, data: dto });
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
