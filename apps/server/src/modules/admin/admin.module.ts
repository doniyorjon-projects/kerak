import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { ReportsModule } from "../reports/reports.module";
import { BannersModule } from "../banners/banners.module";

@Module({
  imports: [ReportsModule, BannersModule],
  controllers: [AdminController],
})
export class AdminModule {}
