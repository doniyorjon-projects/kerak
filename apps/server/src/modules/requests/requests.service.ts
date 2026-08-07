import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, RequestStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { FindRequestsDto } from "./dto/find-requests.dto";

const AUTHOR_INCLUDE = {
  author: { select: { id: true, telegramId: true, username: true, firstName: true } },
} as const;

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  create(authorId: string, dto: CreateRequestDto) {
    return this.prisma.request.create({
      data: { ...dto, authorId, status: RequestStatus.ACTIVE },
      include: AUTHOR_INCLUDE,
    });
  }

  findFeed(options: FindRequestsDto) {
    const { categoryId, regionId, districtId, q } = options;
    const where: Prisma.RequestWhereInput = {
      status: RequestStatus.ACTIVE,
      ...(categoryId ? { categoryId } : {}),
      ...(regionId ? { regionId } : {}),
      ...(districtId ? { districtId } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return this.prisma.request.findMany({ where, include: AUTHOR_INCLUDE, orderBy: { createdAt: "desc" } });
  }

  findMine(authorId: string) {
    return this.prisma.request.findMany({
      where: { authorId },
      include: AUTHOR_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.request.findUnique({ where: { id }, include: AUTHOR_INCLUDE });
    if (!request) throw new NotFoundException("So'rov topilmadi");
    return request;
  }

  async update(id: string, authorId: string, dto: UpdateRequestDto, isAdmin = false) {
    const request = await this.prisma.request.findUnique({ where: { id } });
    if (!request) throw new NotFoundException("So'rov topilmadi");
    if (request.authorId !== authorId && !isAdmin) throw new ForbiddenException("Bu sizning so'rovingiz emas");

    return this.prisma.request.update({ where: { id }, data: dto, include: AUTHOR_INCLUDE });
  }

  async remove(id: string, authorId: string, isAdmin = false) {
    const request = await this.prisma.request.findUnique({ where: { id } });
    if (!request) throw new NotFoundException("So'rov topilmadi");
    if (request.authorId !== authorId && !isAdmin) throw new ForbiddenException("Bu sizning so'rovingiz emas");
    await this.prisma.request.delete({ where: { id } });
  }
}
