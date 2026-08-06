import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdatePricingDto } from "./dto/update-pricing.dto";

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.pricingConfig.findFirst();
    if (existing) return existing;
    return this.prisma.pricingConfig.create({ data: {} });
  }

  async update(dto: UpdatePricingDto) {
    const config = await this.get();
    return this.prisma.pricingConfig.update({ where: { id: config.id }, data: dto });
  }
}
