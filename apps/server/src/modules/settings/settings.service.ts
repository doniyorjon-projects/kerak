import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.botSettings.findFirst();
    if (existing) return existing;
    return this.prisma.botSettings.create({ data: {} });
  }

  async updateChannel(channelId: string | null) {
    const settings = await this.get();
    return this.prisma.botSettings.update({
      where: { id: settings.id },
      data: { channelId: channelId?.trim() || null },
    });
  }
}
