import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SalesController } from "./sales.controller";
import { SalesService } from "./sales.service";
import { SalesRepository } from "./sales.repository";
import { Sale, SaleSchema } from "./schemas/sale.schema";
import { VariantsModule } from "../variants/variants.module";
import { MailModule } from "../mail/mail.module";
import { SALES_DATABASE } from "../common/constants/app.constants";
import { CMSModule } from "../common/contentstack/cms.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Sale.name, schema: SaleSchema }],
      SALES_DATABASE
    ),
    VariantsModule, // Import to access VariantsRepository
    MailModule, // Import to access MailService
    CMSModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, SalesRepository],
  exports: [SalesService, SalesRepository],
})
export class SalesModule {}
