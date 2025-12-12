import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Put,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductsInputDto } from "./dto/create-products.dto";
import { SearchProductsDto } from "./dto/search-products.dto";

@Controller("products")
// @UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() input: CreateProductsInputDto) {
    return this.productsService.createProduct(input);
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
  update(
    @Param("uid") uid: string,
    @Body() updateData: Partial<CreateProductsInputDto>
  ) {
    return this.productsService.updateProduct(uid, updateData);
  }

  @Delete(":uid")
  remove(@Param("uid") uid: string) {
    return this.productsService.deleteProduct(uid);
  }
}
