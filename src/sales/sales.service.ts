import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import * as ExcelJS from "exceljs";
import PDFDocument = require("pdfkit");
import { MailService } from "../mail/mail.service";
import { SaleDocument } from "./schemas/sale.schema";
import { CreateSaleInputDto } from "./dto/create-sale.dto";
import { OutputDto } from "../common/dto/query-result";
import { LoggerService } from "../common/logger/logger.service";
import { VariantsService } from "src/variants/variants.service";
import { CMSApiService } from "src/common/contentstack/cms-api.service";
import { CMSApiHelperService } from "src/common/contentstack/cms-api-helper.service";
import { CONTENT_TYPES } from "src/common/constants/app.constants";
import { SALE_STATUS_ENUM } from "src/common/enums";

@Injectable()
export class SalesService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly variantsService: VariantsService,
    private readonly mailService: MailService,
    private readonly cmsApiService: CMSApiService,
    private readonly cmsApiHelperService: CMSApiHelperService
  ) {}

  private async getNextInvoiceNumber(): Promise<string> {
    const url = this.cmsApiHelperService.getAllEntriesUrl(CONTENT_TYPES.SALES);
    const result = await this.cmsApiService.getAllEntries({
      url,
      limit: 1,
      sort: 'created_at',
      order: 'desc',
    });
    const lastInvoiceNumber = parseInt(result.items?.[0]?.invoice_number ?? '0', 10);
    return String(lastInvoiceNumber + 1).padStart(5, '0');
  }

  /**
   * Create a new sale and mark variant as sold
   */
  async create(input: CreateSaleInputDto): Promise<SaleDocument> {
    this.loggerService.logMethodEntry("SalesService", "create", {
      variantId: input.variant_uid,
      sellingPrice: input.selling_price,
      customerName: input.customer.name,
    });

    try {
      const { variant_uid } = input;

      // Fetch variant details to enrich the sale data
      const existingVariant =
        await this.variantsService.findOneVariant(variant_uid);
      if (!existingVariant) {
        throw new NotFoundException(`Variant with ID ${variant_uid} not found`);
      }

      // Calculate profit margin
      const profit_margin = input.selling_price - existingVariant.cost_price;

      // Enrich sale data with variant information
      // Use IMEI from input if provided, otherwise from variant
      const saleImei = input.imei || existingVariant.imei;

      if (!saleImei) {
        throw new Error(`IMEI is required for sale`);
      }

      const invoice_number = await this.getNextInvoiceNumber();

      const enrichedSaleData = {
        ...input,
        product_name: existingVariant.product_name,
        name: existingVariant.name || existingVariant.product_name,
        imei: saleImei,
        category: existingVariant.category,
        brand: existingVariant.brand,
        branch: existingVariant.branch,
        cost_price: existingVariant.cost_price,
        profit_margin,
        ram: existingVariant.attributes?.ram,
        storage: existingVariant.attributes?.storage,
        invoice_number,
        status: SALE_STATUS_ENUM.ACTIVE,
      };
      const url = this.cmsApiHelperService.createOneEntryUrl(
        CONTENT_TYPES.SALES
      );
      const inputPayload = {
        url,
        data: { entry: enrichedSaleData },
      };
      const result = await this.cmsApiService.createEntry(inputPayload);

      // delete entry variant

      if (existingVariant?.quantity > 1) {
        const variantUpdationUrl = this.cmsApiHelperService.updateOneEntryUrl(
          CONTENT_TYPES.VARIANTS,
          variant_uid
        );
        const variantUpdationInput = {
          url: variantUpdationUrl,
          data: {
            entry: {
              quantity: existingVariant?.quantity - 1,
            },
          },
        };
        await this.cmsApiService.updateEntry(variantUpdationInput);
      } else {
        const variantDeletionUrl = this.cmsApiHelperService.deleteOneEntryUrl(
          CONTENT_TYPES.VARIANTS,
          variant_uid
        );
        const variantDeletionInput = {
          url: variantDeletionUrl,
        };
        await this.cmsApiService.deleteEntry(variantDeletionInput);
      }

      return result;
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create sale: ${error?.message}`);
    }
  }

  /**
   * Find all sales with optional filtering
   */
  async searchSales(
    filters: {
      branch?: string;
      brand?: string;
      search?: string;
      created_at?: { $gte: string; $lte: string };
    } = {}
  ): Promise<OutputDto<SaleDocument>> {
    this.loggerService.logMethodEntry("SalesService", "searchSales", filters);
    const body: any = {};
    const query: any = {};

    try {
      // Search by name (autocomplete)
      if (filters?.search) {
        query.name = {
          $regex: filters.search,
        };
      }

      // Branch filter
      if (filters.branch) {
        query.branch = { $eq: filters.branch };
      }

      // Brand filter
      if (filters.brand) {
        query.brand = { $eq: filters.brand };
      }

      // Date range filter
      if (filters.created_at) {
        query.created_at = filters.created_at;
      }

      body.query = query;

      const url = this.cmsApiHelperService.getAllEntriesUrl(
        CONTENT_TYPES.SALES
      );
      const inputPayload = { url, body };
      return await this.cmsApiService.getAllEntries(inputPayload);
    } catch (error: any) {
      this.loggerService.error({
        message: "Error while searching sales",
        context: "SalesService",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: filters,
      });

      throw new Error(`Failed to search sales: ${error.message}`);
    }
  }

  /**
   * Find sale by ID
   */
  async findSaleByUid(uid: string): Promise<SaleDocument> {
    try {
      const url = this.cmsApiHelperService.getOneEntryUrl(
        CONTENT_TYPES.SALES,
        uid
      );
      return await this.cmsApiService.getEntry({ url });
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to find sale: ${error.message}`);
    }
  }

  /**
   * Get sales statistics
   */
  async getStatistics(
    filters: {
      branch?: string;
      brand?: string;
      search?: string;
      created_at?: { $gte: string; $lte: string };
    } = {}
  ): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
  }> {
    try {
      const salesData = await this.searchSales(filters);
      const totalSales = salesData.count;

      // Calculate manually from CMS data
      const totalRevenue = salesData.items.reduce(
        (sum, sale) => sum + (sale.selling_price || 0),
        0
      );
      const totalProfit = salesData.items.reduce(
        (sum, sale) => sum + (sale.profit_margin || 0),
        0
      );

      return { totalSales, totalRevenue, totalProfit };
    } catch (error: any) {
      throw new Error(`Failed to get sales statistics: ${error.message}`);
    }
  }

  /**
   * Export sales data to Excel and send via email
   */
  async exportSalesToExcel(
    filters: {
      branch?: string;
      brand?: string;
      search?: string;
      created_at?: { $gte: string; $lte: string };
    } = {},
    recipientEmail: string
  ): Promise<void> {
    this.loggerService.logMethodEntry("SalesService", "exportSalesToExcel", {
      recipientEmail,
      filters,
    });

    try {
      // Fetch all sales data with the provided filters
      const salesData = await this.searchSales(filters);

      this.loggerService.log({
        message: "Sales data fetched for export",
        context: "SalesService",
        metadata: {
          recordCount: salesData.count,
          filters,
        },
      });

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Data");

      // Add metadata
      worksheet.getCell("A1").value = "Sales Export Report";
      worksheet.getCell("A1").font = { size: 16, bold: true };
      worksheet.getCell("A2").value =
        `Generated on: ${new Date().toLocaleString("en-IN")}`;
      worksheet.getCell("A2").font = { italic: true };

      // Add filter info if applied
      let filterText = "";
      if (filters.branch) filterText += `Branch: ${filters.branch} `;
      if (filters.brand) filterText += `Brand: ${filters.brand} `;
      if (filters.created_at) {
        if (filters.created_at.$gte) {
          filterText += `From: ${new Date(filters.created_at.$gte).toLocaleDateString("en-IN")} `;
        }
        if (filters.created_at.$lte) {
          filterText += `To: ${new Date(filters.created_at.$lte).toLocaleDateString("en-IN")}`;
        }
      }

      if (filterText) {
        worksheet.getCell("A3").value = `Filters: ${filterText}`;
        worksheet.getCell("A3").font = { italic: true };
      }

      // Define columns with headers starting from row 5
      const headerRow = filterText ? 5 : 4;
      worksheet.getRow(headerRow).values = [
        "Product title",
        "Invoice Number",
        "IMEI",
        "Category",
        "Brand",
        "Branch",
        "Customer Name",
        "Customer Phone",
        "Customer Email",
        "Customer Address",
        "Customer City",
        "Customer State",
        "Customer Pincode",
        "Cost Price (₹)",
        "Selling Price (₹)",
        "Profit Margin (₹)",
        "Payment Method",
        "Sold By",
        "Color",
        "RAM (GB)",
        "Storage (GB)",
        "Sale Date",
        "Notes",
      ];

      // Style header row
      const headerRowObj = worksheet.getRow(headerRow);
      headerRowObj.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRowObj.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4CAF50" },
      };
      headerRowObj.alignment = { vertical: "middle", horizontal: "center" };
      headerRowObj.height = 20;

      // Set column widths
      worksheet.columns = [
        { width: 30 }, // Product Name
        { width: 20 }, // Receipt Number
        { width: 15 }, // SKU
        { width: 15 }, // Category
        { width: 15 }, // Brand
        { width: 15 }, // Branch
        { width: 20 }, // Customer Name
        { width: 15 }, // Customer Phone
        { width: 25 }, // Customer Email
        { width: 30 }, // Customer Address
        { width: 15 }, // Customer City
        { width: 15 }, // Customer State
        { width: 12 }, // Customer Pincode
        { width: 15 }, // Cost Price
        { width: 15 }, // Selling Price
        { width: 15 }, // Profit Margin
        { width: 15 }, // Payment Method
        { width: 20 }, // Sold By
        { width: 12 }, // Color
        { width: 10 }, // RAM
        { width: 12 }, // Storage
        { width: 20 }, // Sale Date
        { width: 30 }, // Notes
      ];

      // Add data rows
      salesData.items.forEach((sale) => {
        worksheet.addRow([
          sale.name,
          sale.invoice_number,
          sale.imei,
          sale.category,
          sale.brand,
          sale.branch,
          sale.customer?.name || "N/A",
          sale.customer?.phone || "N/A",
          sale.customer?.email || "N/A",
          sale.customer?.address || "N/A",
          sale.customer?.city || "N/A",
          sale.customer?.state || "N/A",
          sale.customer?.pincode || "N/A",
          sale.cost_price,
          sale.selling_price,
          sale.profit_margin,
          sale.payment_method || "N/A",
          sale.created_by || "N/A",
          sale.color || "N/A",
          sale.ram || "N/A",
          sale.storage || "N/A",
          new Date(sale.created_at).toLocaleString("en-IN"),
          sale.notes || "N/A",
        ]);
      });

      // Add borders to all cells with data
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

      // Add summary at the end — compute from already-fetched data to avoid a second API call
      const summaryStartRow = worksheet.lastRow.number + 3;
      const statistics = {
        totalSales: salesData.count,
        totalRevenue: salesData.items.reduce((sum, sale) => sum + (sale.selling_price || 0), 0),
        totalProfit: salesData.items.reduce((sum, sale) => sum + (sale.profit_margin || 0), 0),
      };

      worksheet.getCell(`A${summaryStartRow}`).value = "Summary";
      worksheet.getCell(`A${summaryStartRow}`).font = {
        size: 14,
        bold: true,
      };

      worksheet.getCell(`A${summaryStartRow + 1}`).value = "Total Sales:";
      worksheet.getCell(`B${summaryStartRow + 1}`).value =
        statistics.totalSales;

      worksheet.getCell(`A${summaryStartRow + 2}`).value = "Total Revenue:";
      worksheet.getCell(`B${summaryStartRow + 2}`).value =
        `₹${statistics.totalRevenue.toLocaleString("en-IN")}`;

      worksheet.getCell(`A${summaryStartRow + 3}`).value = "Total Profit:";
      worksheet.getCell(`B${summaryStartRow + 3}`).value =
        `₹${statistics.totalProfit.toLocaleString("en-IN")}`;

      // Make summary bold
      for (let i = 1; i <= 3; i++) {
        worksheet.getCell(`A${summaryStartRow + i}`).font = { bold: true };
        worksheet.getCell(`B${summaryStartRow + i}`).font = { bold: true };
      }

      // Generate buffer from workbook
      const buffer = await workbook.xlsx.writeBuffer();

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const fileName = `Sales_Export_${timestamp}.xlsx`;

      // Send email with Excel attachment
      await this.mailService.sendSalesExportEmail(
        recipientEmail,
        Buffer.from(buffer),
        fileName,
        {
          totalRecords: salesData.count,
          filters: filterText || "No filters applied",
          exportDate: new Date().toLocaleString("en-IN"),
        }
      );

      this.loggerService.logMethodExit("SalesService", "exportSalesToExcel", {
        success: true,
        recipientEmail,
        totalRecords: salesData.count,
        fileName,
      });
    } catch (error: any) {
      this.loggerService.error({
        message: "error while exporting sales data",
        context: "SalesService",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: {
          recipientEmail,
          filters,
        },
      });

      throw new Error(`Failed to export sales to Excel: ${error.message}`);
    }
  }

  async generateReceipt(
    saleUid: string
  ): Promise<{ buffer: Buffer; filename: string }> {
    this.loggerService.logMethodEntry("SalesService", "generateReceipt", {
      saleUid,
    });

    try {
      const sale = await this.findSaleByUid(saleUid);
      if (!sale) {
        throw new NotFoundException(`Sale with ID ${saleUid} not found`);
      }

      // Get environment variables
      const GST_NUMBER = process.env.GST_NUMBER || "29EVQPS7668K1Z5";
      const STORE_ADDRESS =
        process.env.STORE_ADDRESS ||
        "No-22/4, Ground Floor, Near Icon Hotel Mahadevapura, bangalore -48,Anandpura TC Palya main road Bangalore-560016";
      const STORE_OWNER_MOBILE = process.env.STORE_OWNER_MOBILE || "9743598240";
      const STORE_OWNER_EMAIL =
        process.env.STORE_OWNER_EMAIL || "purushotham170@gmail.com";
      const STORE_STATE_ADDRESS =
        process.env.STORE_STATE_ADDRESS || "29-Karnataka";

      // Calculate GST (18% split into SGST 9% and CGST 9%)
      const sellingPrice = sale.selling_price;
      const subtotal = sellingPrice / 1.18; // Price before GST
      const sgst = subtotal * 0.09; // 9% SGST
      const cgst = subtotal * 0.09; // 9% CGST
      const totalGST = sgst + cgst;

      // Convert amount to words (simplified)
      const convertToWords = (amount: number): string => {
        const ones = [
          "",
          "One",
          "Two",
          "Three",
          "Four",
          "Five",
          "Six",
          "Seven",
          "Eight",
          "Nine",
        ];
        const tens = [
          "",
          "",
          "Twenty",
          "Thirty",
          "Forty",
          "Fifty",
          "Sixty",
          "Seventy",
          "Eighty",
          "Ninety",
        ];
        const teens = [
          "Ten",
          "Eleven",
          "Twelve",
          "Thirteen",
          "Fourteen",
          "Fifteen",
          "Sixteen",
          "Seventeen",
          "Eighteen",
          "Nineteen",
        ];

        if (amount === 0) return "Zero";

        const numToWords = (n: number): string => {
          if (n === 0) return "";
          if (n < 10) return ones[n];
          if (n < 20) return teens[n - 10];
          if (n < 100)
            return (
              tens[Math.floor(n / 10)] +
              (n % 10 !== 0 ? " " + ones[n % 10] : "")
            );
          if (n < 1000)
            return (
              ones[Math.floor(n / 100)] +
              " Hundred" +
              (n % 100 !== 0 ? " and " + numToWords(n % 100) : "")
            );
          if (n < 100000)
            return (
              numToWords(Math.floor(n / 1000)) +
              " Thousand" +
              (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "")
            );
          if (n < 10000000)
            return (
              numToWords(Math.floor(n / 100000)) +
              " Lakh" +
              (n % 100000 !== 0 ? " " + numToWords(n % 100000) : "")
            );
          return (
            numToWords(Math.floor(n / 10000000)) +
            " Crore" +
            (n % 10000000 !== 0 ? " " + numToWords(n % 10000000) : "")
          );
        };

        return numToWords(Math.floor(amount)) + " Rupees only";
      };

      const amountInWords = convertToWords(sellingPrice);

      const invoiceNo = sale.invoice_number;

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      // Register NotoSans fonts (supports ₹ and full Unicode)
      const fs = require("fs");
      const path = require("path");
      const fontRegular = path.join(
        process.cwd(),
        "assets",
        "fonts",
        "NotoSans-Regular.ttf"
      );
      const fontBold = path.join(
        process.cwd(),
        "assets",
        "fonts",
        "NotoSans-Bold.ttf"
      );
      if (fs.existsSync(fontRegular) && fs.existsSync(fontBold)) {
        doc.registerFont("NotoSans", fontRegular);
        doc.registerFont("NotoSans-Bold", fontBold);
      } else {
        doc.registerFont("NotoSans", "Helvetica");
        doc.registerFont("NotoSans-Bold", "Helvetica-Bold");
      }

      const rupeeSymbol = "₹";

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));

      // --- HEADER SECTION ---
      // Add logo on top right (if exists)
      try {
        const logoPath = path.join(process.cwd(), "assets", "logo.png");

        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 480, 40, { width: 80, height: 80 });
        }
      } catch (error: any) {
        // Logo not found, continue without it
        this.loggerService.warn({
          message: "Logo file not found, skipping logo in receipt",
          context: "SalesService",
        });
      }

      doc
        .fontSize(20)
        .font("NotoSans-Bold")
        .text("Revathi Enterprises", 50, 50);

      doc
        .fontSize(9)
        .font("NotoSans")
        .text(STORE_ADDRESS, 50, 75, { width: 350, lineGap: 2 });

      doc.text(`Phone no.: ${STORE_OWNER_MOBILE}`, 50, doc.y + 2);
      doc.text(`Email: ${STORE_OWNER_EMAIL}`, 50, doc.y + 2);
      doc.text(`GSTIN: ${GST_NUMBER}`, 50, doc.y + 2);
      doc.text(`State: ${STORE_STATE_ADDRESS}`, 50, doc.y + 2);

      // Horizontal line below header
      doc
        .moveTo(50, doc.y + 10)
        .lineTo(550, doc.y + 10)
        .stroke();

      // TAX INVOICE TITLE (centered and bold)
      doc
        .fontSize(18)
        .font("NotoSans-Bold")
        .fillColor("#6366F1") // Purple color
        .text("Tax Invoice", 50, doc.y + 15, { align: "center", width: 500 });

      doc.fillColor("#000000"); // Reset to black

      doc.moveDown(1.5);

      // --- BILL TO & INVOICE DETAILS SECTION ---
      const billToY = doc.y;

      // Left side - Bill To
      doc.fontSize(10).font("NotoSans-Bold").text("Bill To", 50, billToY);
      doc
        .fontSize(11)
        .font("NotoSans-Bold")
        .text(sale.customer.name.toUpperCase(), 50, billToY + 18);
      doc
        .fontSize(9)
        .font("NotoSans")
        .text(`Contact No.: ${sale.customer.phone}`, 50, billToY + 35);

      // Right side - Invoice Details
      doc
        .fontSize(10)
        .font("NotoSans-Bold")
        .text("Invoice Details", 350, billToY, { align: "right" });
      doc
        .fontSize(9)
        .font("NotoSans")
        .text(`Invoice No.: ${invoiceNo}`, 350, billToY + 18, {
          align: "right",
        })
        .text(
          `Date: ${new Date(sale.created_at).toLocaleDateString("en-GB")}`,
          350,
          billToY + 31,
          { align: "right" }
        )
        .text(
          `Time: ${new Date(sale.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`,
          350,
          billToY + 44,
          { align: "right" }
        );

      doc.moveDown(4);

      // --- TABLE SECTION ---
      const tableTop = doc.y + 10;
      const col1X = 50;  // #
      const col2X = 70;  // Item name (wider — HSN/SAC column removed)
      const col3X = 315; // Quantity
      const col4X = 360; // Price/unit
      const col5X = 425; // GST
      const col6X = 483; // Amount

      // Table Header (Purple background)
      doc.rect(col1X, tableTop, 500, 20).fillAndStroke("#8B5CF6", "#000");

      doc.fillColor("#FFFFFF").fontSize(9).font("NotoSans-Bold");
      doc.text("#", col1X + 5, tableTop + 6);
      doc.text("Item name", col2X + 5, tableTop + 6);
      doc.text("Qty", col3X + 5, tableTop + 6);
      doc.text("Price/unit", col4X + 5, tableTop + 6);
      doc.text("GST", col5X + 5, tableTop + 6);
      doc.text("Amount", col6X + 5, tableTop + 6);

      // Table Row
      const rowTop = tableTop + 25;
      doc.fillColor("#000000").fontSize(8).font("NotoSans");

      const productTitle = (sale.name || sale.product_name || "Product").toUpperCase();
      const specsLine = [
        sale.imei ? `IMEI: ${sale.imei}` : null,
        sale.ram ? `${sale.ram}GB RAM` : null,
        sale.storage ? `${sale.storage}GB Storage` : null,
      ].filter(Boolean).join(" | ");
      const itemName = specsLine ? `${productTitle}\n${specsLine}` : productTitle;

      doc.text("1", col1X + 5, rowTop);
      doc.text(itemName, col2X + 5, rowTop, { width: 238 });
      doc.text("1", col3X + 5, rowTop);
      doc.text(`${rupeeSymbol} ${subtotal.toFixed(2)}`, col4X + 5, rowTop);
      doc.text(`${rupeeSymbol} ${totalGST.toFixed(2)}`, col5X + 5, rowTop);
      doc.text(
        `${rupeeSymbol} ${sellingPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        col6X + 5,
        rowTop,
        { align: "right", width: 57 }
      );

      // Total Row — extra gap to accommodate 2-line item name
      const totalRowTop = rowTop + 45;
      doc.rect(col1X, totalRowTop, 500, 20).stroke();
      doc.fontSize(9).font("NotoSans-Bold");
      doc.text("Total", col2X + 5, totalRowTop + 6);
      doc.text("1", col3X + 5, totalRowTop + 6);
      doc.text(
        `${rupeeSymbol} ${totalGST.toFixed(2)}`,
        col5X + 5,
        totalRowTop + 6
      );
      doc.text(
        `${rupeeSymbol} ${sellingPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        col6X + 5,
        totalRowTop + 6,
        { align: "right", width: 57 }
      );

      doc.moveDown(3);

      // --- BOTTOM SECTION ---
      const bottomY = totalRowTop + 40;

      // Left side - Amount in words & Payment Details
      doc
        .fontSize(9)
        .font("NotoSans-Bold")
        .text("Invoice Amount In Words", col1X, bottomY);
      doc
        .fontSize(9)
        .font("NotoSans")
        .text(amountInWords, col1X, bottomY + 15, { width: 300 });

      // Payment Details Section
      doc
        .fontSize(9)
        .font("NotoSans-Bold")
        .text("Mode of Payment", col1X, bottomY + 45);
      doc
        .fontSize(9)
        .font("NotoSans")
        .text(sale.payment_method || "N/A", col1X, bottomY + 60);

      // Show Finance details if payment method is Finance
      let nextYPosition = bottomY + 80; // Track next Y position
      if (sale.payment_method === "Finance" && sale.finance_provider) {
        doc
          .fontSize(9)
          .font("NotoSans-Bold")
          .text("Finance Provider", col1X, nextYPosition);
        doc
          .fontSize(9)
          .font("NotoSans")
          .text(sale.finance_provider, col1X, nextYPosition + 15);

        doc
          .fontSize(9)
          .font("NotoSans-Bold")
          .text("EMI Duration", col1X, nextYPosition + 35);
        doc
          .fontSize(9)
          .font("NotoSans")
          .text(`${sale.emi_duration || 0} months`, col1X, nextYPosition + 50);

        nextYPosition += 70; // Move down after finance details
      } else {
        nextYPosition = bottomY + 60; // Less space if no finance info
      }

      // Right side - Summary
      doc.fontSize(9).font("NotoSans");
      doc.text("Sub Total", 350, bottomY, { align: "left", width: 100 });
      doc.text(`${rupeeSymbol} ${subtotal.toFixed(2)}`, 470, bottomY, {
        align: "right",
        width: 80,
      });

      doc.text("SGST@9.0%", 350, bottomY + 18, { align: "left", width: 100 });
      doc.text(`${rupeeSymbol} ${sgst.toFixed(2)}`, 470, bottomY + 18, {
        align: "right",
        width: 80,
      });

      doc.text("CGST@9.0%", 350, bottomY + 36, { align: "left", width: 100 });
      doc.text(`${rupeeSymbol} ${cgst.toFixed(2)}`, 470, bottomY + 36, {
        align: "right",
        width: 80,
      });

      // Total with purple background
      doc.rect(350, bottomY + 52, 200, 20).fillAndStroke("#8B5CF6", "#000");
      doc.fillColor("#FFFFFF").fontSize(10).font("NotoSans-Bold");
      doc.text("Total", 350, bottomY + 58, { align: "left", width: 100 });
      doc.text(
        `${rupeeSymbol} ${sellingPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        470,
        bottomY + 58,
        { align: "right", width: 80 }
      );

      doc.fillColor("#000000").fontSize(9).font("NotoSans");
      doc.text("Received", 350, bottomY + 78, { align: "left", width: 100 });
      doc.text(
        `${rupeeSymbol} ${sellingPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        470,
        bottomY + 78,
        { align: "right", width: 80 }
      );

      doc.text("Balance", 350, bottomY + 96, { align: "left", width: 100 });
      doc.text(`${rupeeSymbol} 0.00`, 470, bottomY + 96, {
        align: "right",
        width: 80,
      });

      // --- FOOTER ---
      // Calculate Y position that clears both left and right side content
      // Right side ends at bottomY + 96 (Balance), left side at nextYPosition
      const thankYouPosition = Math.max(nextYPosition + 20, bottomY + 115);

      // --- RIGHT SIDE: Authorized Signatory label → stamp below it ---
      const signaturePath = path.join(process.cwd(), "assets", "signature.png");
      const stampWidth = 150;
      const stampX = 400;

      // Label first
      doc
        .fontSize(8)
        .font("NotoSans")
        .text("Authorized Signatory", stampX, thankYouPosition, {
          width: stampWidth,
          align: "center",
        });

      // Stamp/seal image below the label
      const stampY = thankYouPosition + 14;
      if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, stampX, stampY, { width: stampWidth });
      }
      const stampHeight = Math.round(stampWidth * (899 / 1599)); // ~84pt

      // --- THANK YOU (full-width, below stamp, no overlap) ---
      const footerY = stampY + stampHeight + 16;
      doc
        .moveTo(50, footerY)
        .lineTo(550, footerY)
        .strokeColor("#cccccc")
        .lineWidth(0.5)
        .stroke();
      doc
        .strokeColor("#000000")
        .lineWidth(1)
        .fontSize(9)
        .font("NotoSans-Bold")
        .text("Thank you for doing business with us.", 50, footerY + 8, {
          align: "center",
          width: 500,
        });

      doc.end();

      await new Promise<void>((resolve) => doc.on("end", () => resolve()));

      const buffer = Buffer.concat(chunks);
      const filename = `Tax_Invoice_${invoiceNo}.pdf`;

      this.loggerService.logMethodExit("SalesService", "generateReceipt", {
        saleUid,
        filename,
      });

      return { buffer, filename };
    } catch (error: any) {
      this.loggerService.error({
        message: "Error generating receipt",
        context: "SalesService",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: { saleUid },
      });
      throw error;
    }
  }

  async emailReceipt(saleUid: string, recipientEmail: string): Promise<void> {
    this.loggerService.logMethodEntry("SalesService", "emailReceipt", {
      saleUid,
      recipientEmail,
    });

    try {
      const { buffer, filename } = await this.generateReceipt(saleUid);
      const sale = await this.findSaleByUid(saleUid);

      await this.mailService.sendEmail({
        to: recipientEmail,
        subject: `Sales Receipt - ${filename}`,
        html: `
          <h2>Sales Receipt</h2>
          <p>${sale.customer.name},</p>
          <p>Thank you for your purchase. Please find your sales receipt attached.</p>
          <br/>
          <p><strong>Order Details:</strong></p>
          <ul>
            <li>Receipt No: ${sale.uid.toString().slice(-8).toUpperCase()}</li>
            <li>Product: ${sale.name}</li>
            <li>Amount: ₹${sale.selling_price.toLocaleString("en-IN")}</li>
            <li>Date: ${new Date(sale.created_at).toLocaleDateString("en-IN")}</li>
          </ul>
          <br/>
          <p>Thank you for your business!</p>
          <br/>
          <p>Best regards,<br/>Revathi Enterprises</p>
        `,
        attachments: [
          {
            filename,
            content: buffer,
          },
        ],
      });

      this.loggerService.logMethodExit("SalesService", "emailReceipt", {
        saleUid,
        recipientEmail,
        success: true,
      });
    } catch (error: any) {
      this.loggerService.error({
        message: "Error emailing receipt",
        context: "SalesService",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: { saleUid, recipientEmail },
      });
      throw error;
    }
  }
}
