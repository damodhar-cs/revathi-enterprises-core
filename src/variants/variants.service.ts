import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import * as ExcelJS from "exceljs";
import { VariantDocument } from "./schemas/variant.schema";
import { CreateVariantInputDto } from "./dto/create-variant.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { VariantsRepository } from "./variants.repository";
import { OutputDto } from "../common/dto/query-result";
import { CONTENT_TYPES } from "../common/constants/app.constants";
import { CMSApiHelperService } from "../common/contentstack/cms-api-helper.service";
import { CMSApiService } from "../common/contentstack/cms-api.service";
import { ProductsService } from "../products/products.service";
import { MailService } from "../mail/mail.service";

/**
 * Variants service handling business logic for variant operations
 * Uses repository pattern for data access
 */
@Injectable()
export class VariantsService {
  constructor(
    private readonly variantsRepository: VariantsRepository,
    private readonly productsService: ProductsService,
    private readonly cmsApiService: CMSApiService,
    private readonly cmsApiHelperService: CMSApiHelperService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Create a new variant
   */
  async create(input: CreateVariantInputDto): Promise<VariantDocument> {
    try {
      const { product_uid } = input;
      if (!input?.quantity) {
        input.quantity = 1;
      }

      await this.productsService.findOne(product_uid);

      const url = this.cmsApiHelperService.createOneEntryUrl(
        CONTENT_TYPES.VARIANTS,
      );
      const inputPayload = {
        url,
        data: { entry: { ...input } },
      };
      const result = await this.cmsApiService.createEntry(inputPayload);

      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create variant: ${message}`);
    }
  }

  async searchVariants(input: any): Promise<OutputDto<VariantDocument>> {
    const body: any = {};
    const query: any = {};

    // Search by name or IMEI
    if (input?.search) {
      query.$or = [
        { name: { $regex: input.search } },
        { imei: { $regex: input.search } },
      ];
    }

    if (input.product_uid) {
      query.product_uid = { $eq: input.product_uid };
    }

    // Category filter
    if (input.category) {
      query.category = { $eq: input.category };
    }

    // Brand filter
    if (input.brand) {
      query.brand = { $eq: input.brand };
    }

    // Branch filter
    if (input.branch) {
      query.branch = { $eq: input.branch };
    }

    // Date range filter
    if (input.created_at) {
      query.created_at = input.created_at;
    }

    body.query = query;

    const url = this.cmsApiHelperService.getAllEntriesUrl(
      CONTENT_TYPES.VARIANTS,
    );
    const inputPayload = {
      url,
      body,
      skip: input.skip,
      limit: input.limit,
      sort: input.sort,
      order: input.order,
    };
    return await this.cmsApiService.getAllEntries(inputPayload);
  }

  async findOneVariant(uid: string): Promise<any> {
    const url = this.cmsApiHelperService.getOneEntryUrl(
      CONTENT_TYPES.VARIANTS,
      uid,
    );
    const variant = await this.cmsApiService.getEntry({ url });

    if (variant?.product_uid) {
      try {
        const product = await this.productsService.findOne(variant.product_uid);
        if (product) {
          return {
            ...variant,
            product_name: product.title || variant.product_name,
            product: { uid: product.uid, title: product.title },
          };
        }
      } catch {
        // product not found — return variant as-is
      }
    }

    return variant;
  }

  /**
   * Update a variant
   */
  async updateVariant(
    uid: string,
    updateVariantDto: UpdateVariantDto,
  ): Promise<VariantDocument> {
    try {
      const url = this.cmsApiHelperService.updateOneEntryUrl(
        CONTENT_TYPES.VARIANTS,
        uid,
      );
      const inputPayload = {
        url,
        data: {
          entry: updateVariantDto,
        },
      };
      return await this.cmsApiService.updateEntry(inputPayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update variant: ${message}`);
    }
  }

  /**
   * Delete a variant
   */
  async deleteVariant(uid: string): Promise<void> {
    try {
      const url = this.cmsApiHelperService.deleteOneEntryUrl(
        CONTENT_TYPES.VARIANTS,
        uid,
      );
      return await this.cmsApiService.deleteEntry({ url });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete variant: ${message}`);
    }
  }

  async exportVariantsToExcel(
    filters: {
      search?: string;
      category?: string;
      brand?: string;
      branch?: string;
      created_at?: { $gte: string; $lte: string };
    } = {},
    recipientEmail: string,
  ): Promise<void> {
    try {
      const variantsData = await this.searchVariants({ ...filters, limit: 10000 });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Variants Data");

      worksheet.getCell("A1").value = "Variants Export Report";
      worksheet.getCell("A1").font = { size: 16, bold: true };
      worksheet.getCell("A2").value = `Generated on: ${new Date().toLocaleString("en-IN")}`;
      worksheet.getCell("A2").font = { italic: true };

      let filterText = "";
      if (filters.search) filterText += `Search: ${filters.search} `;
      if (filters.category) filterText += `Category: ${filters.category} `;
      if (filters.brand) filterText += `Brand: ${filters.brand} `;
      if (filters.branch) filterText += `Branch: ${filters.branch} `;
      if (filters.created_at) {
        if (filters.created_at.$gte)
          filterText += `From: ${new Date(filters.created_at.$gte).toLocaleDateString("en-IN")} `;
        if (filters.created_at.$lte)
          filterText += `To: ${new Date(filters.created_at.$lte).toLocaleDateString("en-IN")}`;
      }

      if (filterText) {
        worksheet.getCell("A3").value = `Filters: ${filterText}`;
        worksheet.getCell("A3").font = { italic: true };
      }

      const headerRow = filterText ? 5 : 4;
      worksheet.getRow(headerRow).values = [
        "Name",
        "IMEI/Variant Code",
        "Category",
        "Brand",
        "Branch",
        "RAM (GB)",
        "Storage (GB)",
        "Color",
        "Cost Price (₹)",
        "Created At",
        "Updated At",
      ];

      const headerRowObj = worksheet.getRow(headerRow);
      headerRowObj.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRowObj.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1976D2" },
      };
      headerRowObj.alignment = { vertical: "middle", horizontal: "center" };
      headerRowObj.height = 20;

      worksheet.columns = [
        { width: 35 }, // Name
        { width: 20 }, // IMEI
        { width: 15 }, // Category
        { width: 15 }, // Brand
        { width: 18 }, // Branch
        { width: 12 }, // RAM
        { width: 14 }, // Storage
        { width: 12 }, // Color
        { width: 16 }, // Cost Price
        { width: 22 }, // Created At
        { width: 22 }, // Updated At
      ];

      variantsData.items.forEach((variant: any) => {
        worksheet.addRow([
          variant.name || variant.product_name || "N/A",
          variant.imei || "N/A",
          variant.category,
          variant.brand,
          variant.branch,
          variant.attributes?.ram || "N/A",
          variant.attributes?.storage || "N/A",
          variant.attributes?.color || "N/A",
          variant.cost_price,
          variant.created_at
            ? new Date(variant.created_at).toLocaleString("en-IN")
            : "N/A",
          variant.updated_at
            ? new Date(variant.updated_at).toLocaleString("en-IN")
            : "N/A",
        ]);
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber >= headerRow) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const fileName = `Variants_Export_${timestamp}.xlsx`;

      await this.mailService.sendVariantsExportEmail(
        recipientEmail,
        Buffer.from(buffer),
        fileName,
        {
          totalRecords: variantsData.count,
          filters: filterText || "No filters applied",
          exportDate: new Date().toLocaleString("en-IN"),
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to export variants to Excel: ${message}`);
    }
  }

  shortId(length = 4) {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length)
      .toUpperCase();
  }
}
