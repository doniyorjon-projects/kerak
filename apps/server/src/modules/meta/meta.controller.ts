import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Controller()
export class MetaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  getHealth() {
    return { status: "ok" };
  }

  @Get("meta/advertise-contact")
  async getAdvertiseContact() {
    const admin = await this.prisma.user.findFirst({
      where: { isAdmin: true },
      select: { username: true, telegramId: true },
    });
    return { username: admin?.username ?? null, telegramId: admin?.telegramId ?? null };
  }
}
