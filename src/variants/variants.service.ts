import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { VariantDocument } from "./schemas/variant.schema";
import { CreateVariantInputDto } from "./dto/create-variant.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { VariantsRepository } from "./variants.repository";
import { OutputDto } from "../common/dto/query-result";
import { ProductStatusEnum } from "./enums/variants.enum";
import { FindAllVariantsQuery } from "./interface/variants-query.interface";
import {
  CONTENT_TYPES,
  DEFAULT_LIMIT,
} from "../common/constants/app.constants";
import { CMSApiHelperService } from "../common/contentstack/cms-api-helper.service";
import { CMSApiService } from "../common/contentstack/cms-api.service";
import { ProductsService } from "../products/products.service";

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
    private readonly cmsApiHelperService: CMSApiHelperService
  ) {}

  /**
   * Create a new variant
   */
  async create(input: CreateVariantInputDto): Promise<VariantDocument> {
    try {
      const { product_name, product_uid } = input;

      await this.productsService.findOne(product_uid);

      const customTitle = `${product_name} variant ${this.shortId()}`;

      const url = this.cmsApiHelperService.createOneEntryUrl(
        CONTENT_TYPES.VARIANTS
      );
      const inputPayload = {
        url,
        data: { entry: { ...input, title: customTitle } },
      };
      const result = await this.cmsApiService.createEntry(inputPayload);

      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create variant: ${error.message}`);
    }
  }

  async findAllVariants(input): Promise<OutputDto<VariantDocument>> {
    // input filters needs to be added to request
    const body: any = {};
    if (input?.search) {
      body.query = {
        title: {
          $regex: input.search,
        },
      };
    }

    if (input.productId) {
      input.productId = input.productId;
    }

    // Category filter
    if (input.category) {
      input.category = input.category;
    }

    // Branch filter
    if (input.branch) {
      input.branch = input.branch;
    }

    const url = this.cmsApiHelperService.getAllEntriesUrl(
      CONTENT_TYPES.VARIANTS
    );
    const inputPayload = { url, body };
    return await this.cmsApiService.getAllEntries(inputPayload);
  }

  /**
   * Find aggregated variants data
   */
  // async findAllAggregatedProducts(input: FindAllVariantsQuery): Promise<any[]> {
  //   try {
  //     const filters: any = {};
  //     const sortingOrder = input?.order ? Number(input?.order) : -1;
  //     const skip = input?.skip ? Number(input?.skip) : 0;
  //     const limit = input?.limit ? Number(input.limit) : DEFAULT_LIMIT;
  //     // Category filter
  //     if (input?.category) {
  //       filters.category = { $regex: input.category, $options: "i" };
  //     }

  //     // Branch filter
  //     if (input?.branch) {
  //       filters.branch = { $regex: input.branch, $options: "i" };
  //     }

  //     // Search filter
  //     if (input?.search) {
  //       filters.$or = [
  //         { productName: { $regex: input.search, $options: "i" } },
  //       ];
  //     }

  //     const pipeline = [
  //       {
  //         $match: filters,
  //       },
  //       {
  //         $group: {
  //           _id: "$productName",
  //           count: { $sum: 1 },
  //           totalStock: { $sum: "$quantity" },
  //           doc: { $first: "$$ROOT" },
  //         },
  //       },
  //       {
  //         $replaceRoot: {
  //           newRoot: {
  //             $mergeObjects: [
  //               "$doc",
  //               { count: "$count", totalStock: "$totalStock" },
  //             ],
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           stockStatus: {
  //             $switch: {
  //               branches: [
  //                 {
  //                   case: { $gte: ["$totalStock", 3] },
  //                   then: ProductStatusEnum.InStock,
  //                 },
  //                 {
  //                   case: { $eq: ["$totalStock", 0] },
  //                   then: ProductStatusEnum.OutOfStock,
  //                 },
  //               ],
  //               default: ProductStatusEnum.LowStock,
  //             },
  //           },
  //         },
  //       },
  //       // {
  //       //   $match: {
  //       //     stockStatus: input?.stockStatus
  //       //       ? input?.stockStatus
  //       //       : ProductStatusEnum.InStock,
  //       //   },
  //       // },
  //       {
  //         $sort: { updatedAt: sortingOrder },
  //       },
  //       {
  //         $skip: skip,
  //       },
  //       {
  //         $limit: limit,
  //       },
  //     ];
  //     console.log(JSON.stringify(pipeline, null, 3), "pipeline");
  //     return await this.variantsRepository.findAggregatedProducts(pipeline);
  //   } catch (error) {
  //     throw new Error(`Failed to find aggregated variants: ${error.message}`);
  //   }
  // }

  /**
   * Find a single variant by ID
   */
  /**
   * Find a product by UID
   */
  async findOneVariant(uid: string): Promise<VariantDocument> {
    const url = this.cmsApiHelperService.getOneEntryUrl(
      CONTENT_TYPES.VARIANTS,
      uid
    );
    return await this.cmsApiService.getEntry({ url });
  }

  /**
   * Update a variant
   */
  async updateVariant(
    uid: string,
    updateVariantDto: UpdateVariantDto
  ): Promise<VariantDocument> {
    try {
      const url = this.cmsApiHelperService.updateOneEntryUrl(
        CONTENT_TYPES.VARIANTS,
        uid
      );
      const inputPayload = {
        url,
        data: {
          entry: updateVariantDto,
        },
      };
      return await this.cmsApiService.updateEntry(inputPayload);
    } catch (error) {
      throw new Error(`Failed to update variant: ${error?.message}`);
    }
  }

  /**
   * Delete a variant
   */
  async deleteVariant(uid: string): Promise<void> {
    try {
      const url = this.cmsApiHelperService.deleteOneEntryUrl(
        CONTENT_TYPES.VARIANTS,
        uid
      );
      return await this.cmsApiService.deleteEntry({ url });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete variant: ${error.message}`);
    }
  }

  shortId(length = 4) {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length)
      .toUpperCase();
  }
}
