import { Injectable, NotFoundException } from "@nestjs/common";
import { SalesRepository } from "../sales/sales.repository";
import { LoggerService } from "../common/logger/logger.service";

@Injectable()
export class CustomersService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly salesRepository: SalesRepository
  ) {}

  async findAllCustomers(search?: string) {
    this.loggerService.logMethodEntry("CustomersService", "findAllCustomers", {
      search,
    });

    try {
      let customers = await this.salesRepository.findUniqueCustomers();

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        customers = customers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(searchLower) ||
            customer.phone.includes(search)
        );
      }

      this.loggerService.logMethodExit("CustomersService", "findAllCustomers");

      return {
        data: customers,
        total: customers.length,
      };
    } catch (error) {
      this.loggerService.error({
        message: "Error finding all customers",
        context: "CustomersService",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: { search },
      });
      throw error;
    }
  }

  async findCustomerByPhone(phone: string) {
    this.loggerService.logMethodEntry("CustomersService", "findCustomerByPhone", {
      phone,
    });

    try {
      const customer = await this.salesRepository.findCustomerByPhone(phone);

      if (!customer) {
        throw new NotFoundException(`Customer with phone ${phone} not found`);
      }

      this.loggerService.logMethodExit("CustomersService", "findCustomerByPhone");

      return customer;
    } catch (error) {
      this.loggerService.error({
        message: "Error finding customer by phone",
        context: "CustomersService",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: { phone },
      });
      throw error;
    }
  }

  async findCustomerSales(phone: string) {
    this.loggerService.logMethodEntry("CustomersService", "findCustomerSales", {
      phone,
    });

    try {
      const sales = await this.salesRepository.findSalesByCustomerPhone(phone);

      this.loggerService.logMethodExit("CustomersService", "findCustomerSales");

      return {
        data: sales,
        total: sales.length,
      };
    } catch (error) {
      this.loggerService.error({
        message: "Error finding customer sales",
        context: "CustomersService",
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

