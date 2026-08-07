import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType, User } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { BotService } from "../bot/bot.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BlocksService } from "../blocks/blocks.service";

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botService: BotService,
    private readonly notificationsService: NotificationsService,
    private readonly blocksService: BlocksService,
  ) {}

  async send(fromUser: User, listingId: string, text: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });
    if (!listing) throw new NotFoundException("Elon topilmadi");
    if (listing.sellerId === fromUser.id) {
      throw new BadRequestException("O'z eloningizga xabar yubora olmaysiz");
    }
    if (await this.blocksService.isBlockedEitherWay(fromUser.id, listing.sellerId)) {
      throw new ForbiddenException("Xabar yuborib bo'lmadi");
    }

    const telegramMessageId = await this.botService.relayNewMessage({
      listingTitle: listing.title,
      fromUser: { firstName: fromUser.firstName, username: fromUser.username },
      toTelegramId: listing.seller.telegramId,
      text,
    });

    await this.prisma.message.create({
      data: {
        listingId,
        fromUserId: fromUser.id,
        toUserId: listing.sellerId,
        text,
        telegramMessageId: telegramMessageId ?? undefined,
      },
    });

    await this.notificationsService.create(
      listing.sellerId,
      NotificationType.NEW_MESSAGE,
      "Yangi xabar",
      `${fromUser.username ? `@${fromUser.username}` : fromUser.firstName}: ${text}`,
      `/listings/${listingId}`,
    );

    return { delivered: telegramMessageId !== null };
  }
}
