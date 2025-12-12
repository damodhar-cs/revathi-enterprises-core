import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { SalesService } from "./sales.service";
import { LoggerService } from "../common/logger/logger.service";
import { CreateSaleInputDto } from "./dto/create-sale.dto";
import { ExportSalesDto } from "./dto/export-sales.dto";
import { SearchSalesDto } from "./dto/search-sales.dto";

@Controller("sales")
// @UseGuards(JwtAuthGuard) // Uncomment when authentication is needed
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly loggerService: LoggerService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSale(@Body() createSaleInputDto: CreateSaleInputDto) {
    return this.salesService.create(createSaleInputDto);
  }

  @Post("search")
  search(@Body() searchDto: SearchSalesDto) {
    return this.salesService.searchSales(searchDto);
  }

  @Post("stats")
  getSalesStatistics(@Body() searchDto: SearchSalesDto) {
    return this.salesService.getStatistics(searchDto);
  }

  @Post("export")
  @HttpCode(HttpStatus.OK)
  async exportSales(@Body() exportSalesDto: ExportSalesDto) {
    this.loggerService.logRequest(
      "SalesController",
      "POST",
      "/sales/export",
      exportSalesDto
    );

    try {
      const filters: any = {};

      if (exportSalesDto.search) {
        filters.search = exportSalesDto.search;
      }

      if (exportSalesDto.branch) {
        filters.branch = exportSalesDto.branch;
      }

      if (exportSalesDto.brand) {
        filters.brand = exportSalesDto.brand;
      }

      if (exportSalesDto.created_at) {
        filters.created_at = exportSalesDto.created_at;
      }

      await this.salesService.exportSalesToExcel(
        filters,
        exportSalesDto.recipientEmail
      );

      const response = {
        message: "Sales export has been sent to your email successfully",
        recipientEmail: exportSalesDto.recipientEmail,
      };

      this.loggerService.logResponse(
        "SalesController",
        "POST",
        "/sales/export",
        HttpStatus.OK
      );

      return response;
    } catch (error) {
      this.loggerService.error({
        message: "Error in exportSales endpoint",
        context: "SalesController",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: {
          recipientEmail: exportSalesDto.recipientEmail,
          filters: exportSalesDto,
        },
      });

      throw error;
    }
  }

  @Get(":uid")
  findSaleByUid(@Param("uid") uid: string) {
    return this.salesService.findSaleByUid(uid);
  }

  @Get(":id/receipt")
  async generateReceipt(@Param("id") id: string, @Res() res: Response) {
    this.loggerService.logRequest(
      "SalesController",
      "GET",
      `/sales/${id}/receipt`,
      {}
    );

    try {
      const { buffer, filename } = await this.salesService.generateReceipt(id);

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length,
      });

      this.loggerService.logResponse(
        "SalesController",
        "GET",
        `/sales/${id}/receipt`,
        HttpStatus.OK
      );

      res.end(buffer);
    } catch (error) {
      this.loggerService.error({
        message: "Error in generateReceipt endpoint",
        context: "SalesController",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: { saleId: id },
      });
      throw error;
    }
  }

  @Post(":id/receipt/email")
  @HttpCode(HttpStatus.OK)
  async emailReceipt(
    @Param("id") id: string,
    @Body("recipientEmail") recipientEmail: string
  ) {
    this.loggerService.logRequest(
      "SalesController",
      "POST",
      `/sales/${id}/receipt/email`,
      { recipientEmail }
    );

    try {
      await this.salesService.emailReceipt(id, recipientEmail);

      const response = {
        message: "Receipt has been sent to email successfully",
        recipientEmail,
      };

      this.loggerService.logResponse(
        "SalesController",
        "POST",
        `/sales/${id}/receipt/email`,
        HttpStatus.OK
      );

      return response;
    } catch (error) {
      this.loggerService.error({
        message: "Error in emailReceipt endpoint",
        context: "SalesController",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: { saleId: id, recipientEmail },
      });
      throw error;
    }
  }
}
