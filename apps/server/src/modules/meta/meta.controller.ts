import { BadGatewayException, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TelegramAuthGuard } from "../../common/telegram-auth.guard";
import { PricingService } from "../pricing/pricing.service";

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  city_district?: string;
  suburb?: string;
  state?: string;
  region?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

@Controller()
export class MetaController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  @Get("health")
  getHealth() {
    return { status: "ok" };
  }

  @Get("pricing")
  getPricing() {
    return this.pricingService.get();
  }

  @Get("meta/advertise-contact")
  async getAdvertiseContact() {
    const admin = await this.prisma.user.findFirst({
      where: { isAdmin: true },
      select: { username: true, telegramId: true },
    });
    return { username: admin?.username ?? null, telegramId: admin?.telegramId ?? null };
  }

  @Get("geo/reverse")
  @UseGuards(TelegramAuthGuard)
  async reverseGeocode(@Query("lat") lat: string, @Query("lng") lng: string) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&accept-language=uz,ru,en&zoom=14`;
    let data: NominatimResponse;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "KerakMiniApp/1.0 (Telegram marketplace bot)" } });
      if (!res.ok) throw new Error(`Nominatim ${res.status}`);
      data = (await res.json()) as NominatimResponse;
    } catch {
      throw new BadGatewayException("Manzilni aniqlab bo'lmadi");
    }

    const addr = data.address ?? {};
    return {
      displayName: data.display_name ?? null,
      place: addr.city ?? addr.town ?? addr.village ?? addr.city_district ?? addr.suburb ?? null,
      district: addr.county ?? null,
      region: addr.state ?? addr.region ?? null,
    };
  }
}
