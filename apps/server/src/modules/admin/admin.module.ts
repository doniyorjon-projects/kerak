import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { ReportsModule } from "../reports/reports.module";
import { BannersModule } from "../banners/banners.module";
import { CategoriesModule } from "../categories/categories.module";

@Module({
  imports: [ReportsModule, BannersModule, CategoriesModule],
  controllers: [AdminController],
})
export class AdminModule {}
