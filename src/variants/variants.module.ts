import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { VariantsService } from "./variants.service";
import { VariantsController } from "./variants.controller";
import { Variant, VariantSchema } from "./schemas/variant.schema";
import { VariantsRepository } from "./variants.repository";
import { PRODUCTS_DATABASE } from "../common/constants/app.constants";
import { ProductsModule } from "../products/products.module";
import { CMSModule } from "../common/contentstack/cms.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Variant.name, schema: VariantSchema }],
      PRODUCTS_DATABASE
    ),
    ProductsModule,
    CMSModule,
  ],
  controllers: [VariantsController],
  providers: [VariantsRepository, VariantsService],
  exports: [VariantsRepository, VariantsService],
})
export class VariantsModule {}
