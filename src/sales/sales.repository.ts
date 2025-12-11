import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale, SaleDocument } from "./schemas/sale.schema";
import { BaseRepository } from "../common/repositories/base.repository";
import { ISalesRepository } from "./interface/sales.repository.interface";
import { OutputDto } from "../common/dto/query-result";
import { SALES_DATABASE } from "src/common/constants/app.constants";

@Injectable()
export class SalesRepository
  extends BaseRepository<SaleDocument>
  implements ISalesRepository
{
  constructor(
    @InjectModel(Sale.name, SALES_DATABASE)
    private readonly saleModel: Model<SaleDocument>
  ) {
    super(saleModel);
  }

  async findSalesByVariantId(variantId: string): Promise<SaleDocument | null> {
    try {
      return await this.findOne({ variantId });
    } catch (error) {
      throw new Error(`Failed to find sale by variant ID: ${error.message}`);
    }
  }

  async getTotalSalesByBranch(branch: string): Promise<number> {
    try {
      return await this.saleModel.countDocuments({ branch });
    } catch (error) {
      throw new Error(`Failed to get total sales by branch: ${error.message}`);
    }
  }

  async getRevenueByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<{ totalRevenue: number; totalProfit: number }> {
    try {
      const result = await this.saleModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$sellingPrice" },
            totalProfit: { $sum: "$profitMargin" },
          },
        },
      ]);

      return result.length > 0
        ? {
            totalRevenue: result[0].totalRevenue,
            totalProfit: result[0].totalProfit,
          }
        : { totalRevenue: 0, totalProfit: 0 };
    } catch (error) {
      throw new Error(`Failed to get revenue by date range: ${error.message}`);
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<SaleDocument[]> {
    try {
      return await this.saleModel
        .find({
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to find sales by date range: ${error.message}`);
    }
  }

  async findRecent(limit: number): Promise<SaleDocument[]> {
    try {
      return await this.saleModel
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      throw new Error(`Failed to find recent sales: ${error.message}`);
    }
  }

  async findUniqueCustomers(): Promise<any[]> {
    try {
      return await this.saleModel.aggregate([
        {
          $group: {
            _id: "$customer.phone",
            name: { $first: "$customer.name" },
            phone: { $first: "$customer.phone" },
            totalPurchases: { $sum: 1 },
            totalSpent: { $sum: "$sellingPrice" },
            lastPurchaseDate: { $max: "$createdAt" },
            firstPurchaseDate: { $min: "$createdAt" },
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
            phone: 1,
            totalPurchases: 1,
            totalSpent: 1,
            averageOrderValue: {
              $divide: ["$totalSpent", "$totalPurchases"],
            },
            lastPurchaseDate: 1,
            firstPurchaseDate: 1,
          },
        },
        {
          $sort: { totalSpent: -1 },
        },
      ]);
    } catch (error) {
      throw new Error(`Failed to find unique customers: ${error.message}`);
    }
  }

  async findCustomerByPhone(phone: string): Promise<any> {
    try {
      const result = await this.saleModel.aggregate([
        {
          $match: { "customer.phone": phone },
        },
        {
          $group: {
            _id: "$customer.phone",
            name: { $first: "$customer.name" },
            phone: { $first: "$customer.phone" },
            totalPurchases: { $sum: 1 },
            totalSpent: { $sum: "$sellingPrice" },
            totalProfit: {
              $sum: { $subtract: ["$sellingPrice", "$purchasePrice"] },
            },
            lastPurchaseDate: { $max: "$createdAt" },
            firstPurchaseDate: { $min: "$createdAt" },
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
            phone: 1,
            totalPurchases: 1,
            totalSpent: 1,
            totalProfit: 1,
            averageOrderValue: {
              $divide: ["$totalSpent", "$totalPurchases"],
            },
            lastPurchaseDate: 1,
            firstPurchaseDate: 1,
          },
        },
      ]);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw new Error(`Failed to find customer by phone: ${error.message}`);
    }
  }

  async findSalesByCustomerPhone(phone: string): Promise<SaleDocument[]> {
    try {
      return await this.saleModel
        .find({ "customer.phone": phone })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(
        `Failed to find sales by customer phone: ${error.message}`
      );
    }
  }
}
