import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Put,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductsInputDto } from "./dto/create-products.dto";

@Controller("products")
// @UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() input: CreateProductsInputDto) {
    return this.productsService.createProduct(input);
  }

  @Get()
  findAll(@Query("search") search?: string) {
    return this.productsService.findAllProducts({
      search,
    });
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
