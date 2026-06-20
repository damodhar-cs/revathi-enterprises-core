import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { ProductsService } from "./products.service";
import { CreateProductsInputDto } from "./dto/create-products.dto";
import { SearchProductsDto } from "./dto/search-products.dto";
import { MESSAGES } from "../common/constants/messages.constants";

@ApiTags("Products")
@Controller("products")
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreateProductsInputDto) {
    const product = await this.productsService.createProduct(input);
    return { message: MESSAGES.PRODUCT.CREATED, product };
  }

  @Post("search")
  search(@Body() searchDto: SearchProductsDto) {
    return this.productsService.searchProducts(searchDto);
  }

  @Get(":uid")
  findOne(@Param("uid") uid: string) {
    return this.productsService.findOne(uid);
  }

  @Put(":uid")
  async update(
    @Param("uid") uid: string,
    @Body() updateData: Partial<CreateProductsInputDto>
  ) {
    const product = await this.productsService.updateProduct(uid, updateData);
    return { message: MESSAGES.PRODUCT.UPDATED, product };
  }

  @Delete(":uid")
  async remove(@Param("uid") uid: string) {
    await this.productsService.deleteProduct(uid);
    return { message: MESSAGES.PRODUCT.DELETED };
  }
}
