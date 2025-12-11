import { IBaseRepository } from "../../common/repositories/base.repository.interface";
import { SaleDocument } from "../schemas/sale.schema";
import { OutputDto } from "../../common/dto/query-result";

export interface ISalesRepository extends IBaseRepository<SaleDocument> {
  findSalesByVariantId(variantId: string): Promise<SaleDocument | null>;

  getRevenueByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<{ totalRevenue: number; totalProfit: number }>;
}
