import { Controller, Get, UseGuards, Post, Body } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { DashboardService } from "./dashboard.service";
import { LoggerService } from "../common/logger/logger.service";

@ApiTags("Dashboard")
@Controller("dashboard")
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly loggerService: LoggerService
  ) {}

  @Get("stats")
  async getStats() {
    this.loggerService.logRequest(
      "DashboardController",
      "GET",
      "/dashboard/stats",
      {}
    );

    try {
      const stats = await this.dashboardService.getStats();

      this.loggerService.logResponse(
        "DashboardController",
        "GET",
        "/dashboard/stats",
        200
      );

      return stats;
    } catch (error) {
      this.loggerService.error({
        message: "Error in getStats endpoint",
        context: "DashboardController",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
      });
      throw error;
    }
  }
}
