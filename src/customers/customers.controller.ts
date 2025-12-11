import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CustomersService } from "./customers.service";
import { LoggerService } from "../common/logger/logger.service";

@Controller("customers")
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly loggerService: LoggerService
  ) {}

  @Get()
  async getAllCustomers(@Query("search") search?: string) {
    this.loggerService.logRequest("CustomersController", "GET", "/customers", {
      search,
    });

    try {
      const customers = await this.customersService.findAllCustomers(search);

      this.loggerService.logResponse("CustomersController", "GET", "/customers", 200);

      return customers;
    } catch (error) {
      this.loggerService.error({
        message: "Error in getAllCustomers endpoint",
        context: "CustomersController",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: { search },
      });
      throw error;
    }
  }

  @Get(":phone")
  async getCustomerByPhone(@Param("phone") phone: string) {
    this.loggerService.logRequest(
      "CustomersController",
      "GET",
      `/customers/${phone}`,
      {}
    );

    try {
      const customer = await this.customersService.findCustomerByPhone(phone);

      this.loggerService.logResponse(
        "CustomersController",
        "GET",
        `/customers/${phone}`,
        200
      );

      return customer;
    } catch (error) {
      this.loggerService.error({
        message: "Error in getCustomerByPhone endpoint",
        context: "CustomersController",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: { phone },
      });
      throw error;
    }
  }

  @Get(":phone/sales")
  async getCustomerSales(@Param("phone") phone: string) {
    this.loggerService.logRequest(
      "CustomersController",
      "GET",
      `/customers/${phone}/sales`,
      {}
    );

    try {
      const sales = await this.customersService.findCustomerSales(phone);

      this.loggerService.logResponse(
        "CustomersController",
        "GET",
        `/customers/${phone}/sales`,
        200
      );

      return sales;
    } catch (error) {
      this.loggerService.error({
        message: "Error in getCustomerSales endpoint",
        context: "CustomersController",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: { phone },
      });
      throw error;
    }
  }
}

