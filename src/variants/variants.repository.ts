import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "../common/repositories/base.repository";
import { Variant, VariantDocument } from "./schemas/variant.schema";
import { IVariantsRepository } from "./interface/variants.repository.interface";
import {
  DEFAULT_LIMIT,
  DEFAULT_SORTABLE_FIELD,
  PRODUCTS_DATABASE,
} from "../common/constants/app.constants";
import { OutputDto } from "../common/dto/query-result";
import { ProductStatusEnum } from "./enums/variants.enum";

/**
 * Variants repository implementing variant-specific database operations
 */
@Injectable()
export class VariantsRepository
  extends BaseRepository<VariantDocument>
  implements IVariantsRepository
{
  constructor(
    @InjectModel(Variant.name, PRODUCTS_DATABASE)
    private readonly variantModel: Model<VariantDocument>
  ) {
    super(variantModel);
  }

  /**
   * Find variants with advanced filtering
   */
  async findWithFilters(filters: {
    category?: string;
    brand?: string;
    branch?: string;
    search?: string;
    productId?: string;
    includeSold?: boolean;
  }): Promise<OutputDto<VariantDocument>> {
    try {
      const query: any = {};

      // By default, exclude sold variants unless explicitly requested
      if (!filters.includeSold) {
        query.isSold = { $ne: true };
      }

      // Category filter
      if (filters.category) {
        query.category = filters.category;
      }

      // Brand filter
      if (filters.brand) {
        query.brand = filters.brand;
      }

      // Branch filter
      if (filters.branch) {
        query.branch = filters.branch;
      }

      // product filter
      if (filters.productId) {
        query.productId = filters.productId;
      }

      // Search filter (name)
      if (filters.search) {
        query.$or = [
          { productName: { $regex: filters.search, $options: "i" } },
        ];
      }

      console.log(JSON.stringify(query, null, 3), "query");

      return await this.findAll(query, { sort: { updatedAt: -1 } });
    } catch (error) {
      throw new Error(`Failed to find variants with filters: ${error.message}`);
    }
  }

  /**
   * Get aggregated variants data
   */
  async findAggregatedProducts(pipeline: any): Promise<VariantDocument[]> {
    try {
      return await this.aggregate(pipeline);
    } catch (error) {
      throw new Error(`Failed to find aggregated variants: ${error.message}`);
    }
  }
}
