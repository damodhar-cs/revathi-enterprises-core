import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PRODUCTS_DATABASE } from "../common/constants/app.constants";
import { Product, ProductSchema } from "./schema/product.schema";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { CMSModule } from "../common/contentstack/cms.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Product.name, schema: ProductSchema }],
      PRODUCTS_DATABASE
    ),
    CMSModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
