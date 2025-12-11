import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { SalesModule } from "../sales/sales.module";
import { VariantsModule } from "../variants/variants.module";
import { LoggerModule } from "../common/logger/logger.module";

@Module({
  imports: [SalesModule, VariantsModule, LoggerModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

