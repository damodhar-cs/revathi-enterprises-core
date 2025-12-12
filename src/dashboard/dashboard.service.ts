import { Injectable } from "@nestjs/common";
import { SalesService } from "../sales/sales.service";
import { VariantsService } from "../variants/variants.service";
import { LoggerService } from "../common/logger/logger.service";

export interface DashboardStats {
  todaySales: SalesSummary;
  weekSales: SalesSummary;
  monthSales: SalesSummary;
  previousWeekSales: SalesSummary;
  previousMonthSales: SalesSummary;
  inventory: InventoryStatus;
  topProducts: TopProduct[];
  recentSales: RecentSale[];
  branchPerformance: BranchPerformance[];
}

export interface SalesSummary {
  revenue: number;
  profit: number;
  transactionCount: number;
  averageOrderValue: number;
}

export interface InventoryStatus {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface TopProduct {
  product_name: string;
  brand: string;
  category: string;
  salesCount: number;
  revenue: number;
  profit: number;
}

export interface RecentSale {
  _id: string;
  product_name: string;
  sku: string;
  brand: string;
  customer: {
    name: string;
    phone: string;
  };
  selling_price: number;
  profit: number;
  createdAt: Date;
  branch: string;
}

export interface BranchPerformance {
  branch: string;
  revenue: number;
  profit: number;
  transactionCount: number;
  averageOrderValue: number;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly salesService: SalesService,
    private readonly variantsService: VariantsService
  ) {}

  async getStats(): Promise<DashboardStats> {
    this.loggerService.logMethodEntry("DashboardService", "getStats", {});

    try {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      // Week calculation
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const previousWeekStart = new Date(weekStart);
      previousWeekStart.setDate(weekStart.getDate() - 7);
      const previousWeekEnd = new Date(weekStart);
      previousWeekEnd.setMilliseconds(-1);

      // Month calculation
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const previousMonthEnd = new Date(monthStart);
      previousMonthEnd.setMilliseconds(-1);

      // Fetch all data in parallel
      const [
        todaySales,
        weekSales,
        monthSales,
        previousWeekSales,
        previousMonthSales,
        inventory,
        topProducts,
        recentSales,
        branchPerformance,
      ] = await Promise.all([
        this.getSalesSummary(todayStart, now),
        this.getSalesSummary(weekStart, now),
        this.getSalesSummary(monthStart, now),
        this.getSalesSummary(previousWeekStart, previousWeekEnd),
        this.getSalesSummary(previousMonthStart, previousMonthEnd),
        this.getInventoryStatus(),
        this.getTopProducts(weekStart, now, 5),
        this.getRecentSales(10),
        this.getBranchPerformance(monthStart, now),
      ]);

      this.loggerService.logMethodExit("DashboardService", "getStats");

      return {
        todaySales,
        weekSales,
        monthSales,
        previousWeekSales,
        previousMonthSales,
        inventory,
        topProducts,
        recentSales,
        branchPerformance,
      };
    } catch (error) {
      this.loggerService.error({
        message: "Error fetching dashboard stats",
        context: "DashboardService",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
      });
      throw error;
    }
  }

  private async getSalesSummary(
    startDate: Date,
    endDate: Date
  ): Promise<SalesSummary> {
    // Use the new searchSales API with CMS date range format
    const salesResult = await this.salesService.searchSales({
      created_at: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString(),
      },
    });

    const sales = salesResult.items;

    const revenue = sales.reduce(
      (sum, sale) => sum + (sale.selling_price || 0),
      0
    );
    const profit = sales.reduce(
      (sum, sale) => sum + (sale.profit_margin || 0),
      0
    );
    const transactionCount = sales.length;
    const averageOrderValue =
      transactionCount > 0 ? revenue / transactionCount : 0;

    return {
      revenue,
      profit,
      transactionCount,
      averageOrderValue,
    };
  }

  private async getInventoryStatus(): Promise<InventoryStatus> {
    const MIN_STOCK_COUNT = 5;
    const variantsResult = await this.variantsService.searchVariants({});
    const variants = variantsResult.items;

    const totalItems = variants.length;
    const inStock = variants.filter((v) => v.quantity > MIN_STOCK_COUNT).length;
    const lowStock = variants.filter(
      (v) => v.quantity > 0 && v.quantity <= MIN_STOCK_COUNT
    ).length;
    const outOfStock = variants.filter((v) => v.quantity === 0).length;
    const totalValue = variants.reduce(
      (sum, v) => sum + v.cost_price * v.quantity,
      0
    );

    return {
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      totalValue,
    };
  }

  private async getTopProducts(
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<TopProduct[]> {
    // Use the new searchSales API with CMS date range format
    const salesResult = await this.salesService.searchSales({
      created_at: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString(),
      },
    });

    const sales = salesResult.items;

    // Group by product
    const productMap = new Map<string, TopProduct>();

    sales.forEach((sale) => {
      const key = `${sale.product_name}-${sale.brand}`;
      if (!productMap.has(key)) {
        productMap.set(key, {
          product_name: sale.product_name,
          brand: sale.brand,
          category: sale.category,
          salesCount: 0,
          revenue: 0,
          profit: 0,
        });
      }

      const product = productMap.get(key)!;
      product.salesCount += 1;
      product.revenue += sale.selling_price || 0;
      product.profit += sale.profit_margin || 0;
    });

    // Sort by sales count and take top N
    return Array.from(productMap.values())
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, limit);
  }

  private async getRecentSales(limit: number): Promise<RecentSale[]> {
    const salesResult = await this.salesService.searchSales({});

    // Sort by created_at descending and take the specified limit
    const sales = salesResult.items
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);

    return sales.map((sale) => ({
      _id: sale.uid || sale._id?.toString() || "",
      product_name: sale.product_name || "",
      sku: sale.sku || "",
      brand: sale.brand || "",
      customer: sale.customer,
      selling_price: sale.selling_price || 0,
      profit: sale.profit_margin || 0,
      createdAt: new Date(sale.created_at),
      branch: sale.branch || "",
    }));
  }

  private async getBranchPerformance(
    startDate: Date,
    endDate: Date
  ): Promise<BranchPerformance[]> {
    const salesResult = await this.salesService.searchSales({
      created_at: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString(),
      },
    });

    const sales = salesResult.items;

    // Group by branch
    const branchMap = new Map<string, BranchPerformance>();

    sales.forEach((sale) => {
      if (!branchMap.has(sale.branch)) {
        branchMap.set(sale.branch, {
          branch: sale.branch,
          revenue: 0,
          profit: 0,
          transactionCount: 0,
          averageOrderValue: 0,
        });
      }

      const branch = branchMap.get(sale.branch)!;
      branch.revenue += sale.selling_price || 0;
      branch.profit += sale.profit_margin || 0;
      branch.transactionCount += 1;
    });

    // Calculate average order value
    branchMap.forEach((branch) => {
      branch.averageOrderValue =
        branch.transactionCount > 0
          ? branch.revenue / branch.transactionCount
          : 0;
    });

    return Array.from(branchMap.values()).sort((a, b) => b.revenue - a.revenue);
  }
}
