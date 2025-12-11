import { Module } from "@nestjs/common";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";
import { SalesModule } from "../sales/sales.module";
import { LoggerModule } from "../common/logger/logger.module";

@Module({
  imports: [SalesModule, LoggerModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}

