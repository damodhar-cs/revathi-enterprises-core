import { OutputDto } from "../../common/dto/query-result";
import { IBaseRepository } from "../../common/repositories/base.repository.interface";
import { VariantDocument } from "../schemas/variant.schema";

/**
 * Interface for variants repository defining variant-specific operations
 */
export interface IVariantsRepository extends IBaseRepository<VariantDocument> {
  /**
   * Find variants with advanced filtering
   */
  findWithFilters(filters: {
    category?: string;
    brand?: string;
    branch?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }): Promise<OutputDto<VariantDocument>>;

  /**
   * Get aggregated variants data
   */
  findAggregatedProducts(filters: {
    category?: string;
    branch?: string;
    search?: string;
  }): Promise<any[]>;
}
