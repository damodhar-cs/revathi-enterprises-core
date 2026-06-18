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
import { CONTENT_TYPES } from "../common/constants/app.constants";
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
      if (!input?.quantity) {
        input.quantity = 1;
      }

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
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create variant: ${message}`);
    }
  }

  async searchVariants(input: any): Promise<OutputDto<VariantDocument>> {
    const body: any = {};
    const query: any = {};

    // Search by title or IMEI
    if (input?.search) {
      query.$or = [
        { title: { $regex: input.search } },
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
      CONTENT_TYPES.VARIANTS
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
        uid
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

  shortId(length = 4) {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length)
      .toUpperCase();
  }
}
