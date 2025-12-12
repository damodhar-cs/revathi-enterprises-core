import { Injectable } from "@nestjs/common";
import { ProductDocument } from "./schema/product.schema";
import {
  CreateProductResponseDto,
  CreateProductsInputDto,
} from "./dto/create-products.dto";
import { OutputDto } from "../common/dto/query-result";
import { CONTENT_TYPES } from "../common/constants/app.constants";
import { CMSApiService } from "../common/contentstack/cms-api.service";
import { CMSApiHelperService } from "../common/contentstack/cms-api-helper.service";
import {
  DeleteProductResponseDto,
  UpdateProductResponseDto,
} from "./dto/update-products.dto";

/**
 * Products service handling business logic for products
 * Uses Contentstack api for data access
 */

@Injectable()
export class ProductsService {
  constructor(
    private readonly cmsApiService: CMSApiService,
    private readonly cmsApiHelperService: CMSApiHelperService
  ) {}

  /**
   * Create a new product
   */

  async createProduct(
    input: CreateProductsInputDto
  ): Promise<CreateProductResponseDto> {
    input.title = input.title.toLowerCase();
    const url = this.cmsApiHelperService.createOneEntryUrl(
      CONTENT_TYPES.PRODUCTS
    );
    const inputPayload = {
      url,
      data: { entry: input },
    };
    return await this.cmsApiService.createEntry(inputPayload);
  }

  async searchProducts(input): Promise<OutputDto<ProductDocument>> {
    const body: any = {};
    const query: any = {};
    
    // Search by title (autocomplete)
    if (input?.search) {
      query.title = {
        $regex: input.search,
      };
    }

    // Filter by brand
    if (input.brand) {
      query.brand = { $eq: input.brand };
    }

    // Filter by category
    if (input.category) {
      query.category = { $eq: input.category };
    }

    // Date range filter
    if (input.created_at) {
      query.created_at = input.created_at;
    }

    body.query = query;

    const url = this.cmsApiHelperService.getAllEntriesUrl(
      CONTENT_TYPES.PRODUCTS
    );
    const inputPayload = { url, body };
    return await this.cmsApiService.getAllEntries(inputPayload);
  }

  /**
   * Find a product by UID
   */
  async findOne(uid: string): Promise<ProductDocument> {
    const url = this.cmsApiHelperService.getOneEntryUrl(
      CONTENT_TYPES.PRODUCTS,
      uid
    );
    return await this.cmsApiService.getEntry({ url });
  }

  /**
   * Update a product by UID
   */
  async updateProduct(
    uid: string,
    updateData: Partial<CreateProductsInputDto>
  ): Promise<UpdateProductResponseDto> {
    const url = this.cmsApiHelperService.updateOneEntryUrl(
      CONTENT_TYPES.PRODUCTS,
      uid
    );
    const inputPayload = {
      url,
      data: {
        entry: updateData,
      },
    };
    return await this.cmsApiService.updateEntry(inputPayload);
  }

  /**
   * Remove a product by UID
   */
  async deleteProduct(uid: string): Promise<DeleteProductResponseDto> {
    const url = this.cmsApiHelperService.deleteOneEntryUrl(
      CONTENT_TYPES.PRODUCTS,
      uid
    );

    return await this.cmsApiService.deleteEntry({ url });
  }
}
