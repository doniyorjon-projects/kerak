import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

const BLOCKED_INCLUDE = {
  blocked: { select: { id: true, telegramId: true, username: true, firstName: true } },
} as const;

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string) {
    const blocks = await this.prisma.userBlock.findMany({
      where: { blockerId: userId },
      include: BLOCKED_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return blocks;
  }

  async checkStatus(blockerId: string, blockedId: string) {
    const block = await this.prisma.userBlock.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });
    return { isBlocked: Boolean(block) };
  }

  async block(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException("O'zingizni bloklay olmaysiz");
    }
    await this.prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });
    return { isBlocked: true };
  }

  async unblock(blockerId: string, blockedId: string) {
    await this.prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
    return { isBlocked: false };
  }

  async isBlockedEitherWay(userAId: string, userBId: string): Promise<boolean> {
    const block = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: userAId, blockedId: userBId },
          { blockerId: userBId, blockedId: userAId },
        ],
      },
    });
    return Boolean(block);
  }
}
