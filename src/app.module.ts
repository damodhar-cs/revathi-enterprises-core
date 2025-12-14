import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { FirebaseModule } from "./firebase/firebase.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { VariantsModule } from "./variants/variants.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProductsModule } from "./products/products.module";
import { SalesModule } from "./sales/sales.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { CustomersModule } from "./customers/customers.module";
import { LoggerModule } from "./common/logger/logger.module";
import {
  PRODUCTS_DATABASE,
  SALES_DATABASE,
  USERS_DATABASE,
} from "./common/constants/app.constants";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseModule,
    LoggerModule,
    MongooseModule.forRoot(process.env.MONGODB_PRODUCTS_URI, {
      connectionName: PRODUCTS_DATABASE,
    }),
    MongooseModule.forRoot(process.env.MONGODB_USERS_URI, {
      connectionName: USERS_DATABASE,
    }),
    MongooseModule.forRoot(process.env.MONGODB_SALES_URI, {
      connectionName: SALES_DATABASE,
    }),
    AuthModule,
    UsersModule,
    VariantsModule,
    ProductsModule,
    SalesModule,
    DashboardModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
