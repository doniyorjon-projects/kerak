import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma, RequestStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { FindRequestsDto } from "./dto/find-requests.dto";
import { BotService } from "../bot/bot.service";

const AUTHOR_INCLUDE = {
  author: { select: { id: true, telegramId: true, username: true, firstName: true } },
} as const;

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
  ) {}

  async create(authorId: string, dto: CreateRequestDto) {
    const request = await this.prisma.request.create({
      data: { ...dto, authorId, status: RequestStatus.ACTIVE },
      include: AUTHOR_INCLUDE,
    });

    // Hammaga xabar berish so'rov yaratish javobini kutdirmasligi uchun
    // fon rejimida ishga tushiriladi (ko'p foydalanuvchi bo'lsa ham API
    // darhol javob qaytaradi).
    void this.notifyAllUsers(request).catch((err) =>
      this.logger.warn(`So'rov haqida xabar berishda xatolik: ${err}`),
    );

    return request;
  }

  private async notifyAllUsers(request: Prisma.RequestGetPayload<{ include: typeof AUTHOR_INCLUDE }>) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: request.authorId },
        isBlocked: false,
        botBlockedAt: null,
      },
      select: { telegramId: true },
    });

    for (const user of users) {
      await this.botService.notifyNewRequestMatch(user.telegramId, request);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
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

  async findOne(id: string, viewerId?: string) {
    const request = await this.prisma.request.findUnique({ where: { id }, include: AUTHOR_INCLUDE });
    if (!request) throw new NotFoundException("So'rov topilmadi");

    if (viewerId && viewerId !== request.authorId && request.status === RequestStatus.ACTIVE) {
      const { count } = await this.prisma.requestView.createMany({
        data: [{ requestId: id, viewerId }],
        skipDuplicates: true,
      });
      if (count > 0) {
        await this.prisma.request.update({ where: { id }, data: { viewsCount: { increment: 1 } } });
        request.viewsCount += 1;
      }
    }

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
