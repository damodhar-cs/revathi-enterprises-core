import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseSchema } from "../../common/base.schema";
import { PAYMENT_METHOD_ENUM, PRODUCT_BRANCH_ENUM, FINANCE_PROVIDER_ENUM, SALE_STATUS_ENUM } from "../../common/enums";
import { ISale, ICustomerInfo } from "../interface/sale.interface";
import { PRODUCT_TYPE_ENUM } from "../../common/enums/products.enum";
import { PRODUCT_BRAND_ENUM } from "../../common/enums/stores.enum";
import { COLOR_ENUM } from "../../common/enums/specifications.enum";

export type SaleDocument = Sale & Document;

@Schema({ _id: false })
export class CustomerInfo implements ICustomerInfo {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  pincode?: string;
}

export const CustomerInfoSchema = SchemaFactory.createForClass(CustomerInfo);

@Schema({ timestamps: true })
export class Sale extends BaseSchema implements ISale {
  // --- Required fields ---
  @Prop({ required: true, trim: true })
  variant_uid: string;

  @Prop({ required: true, trim: true })
  product_name: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  imei: string;

  @Prop({ required: true, enum: PRODUCT_TYPE_ENUM })
  category: PRODUCT_TYPE_ENUM;

  @Prop({ required: true, trim: true, enum: PRODUCT_BRAND_ENUM })
  brand: PRODUCT_BRAND_ENUM;

  @Prop({ required: true, enum: PRODUCT_BRANCH_ENUM })
  branch: PRODUCT_BRANCH_ENUM;

  @Prop({ required: true, min: 0 })
  cost_price: number;

  @Prop({ required: true, min: 0 })
  selling_price: number;

  @Prop({ required: true, min: 0 })
  profit_margin: number;

  @Prop({ required: true, trim: true })
  invoice_number: string;

  @Prop({ required: true, enum: SALE_STATUS_ENUM, default: SALE_STATUS_ENUM.ACTIVE })
  status: SALE_STATUS_ENUM;

  @Prop({ type: CustomerInfoSchema, required: true })
  customer: CustomerInfo;

  // --- Optional fields ---
  @Prop({ enum: PAYMENT_METHOD_ENUM })
  payment_method?: PAYMENT_METHOD_ENUM;

  @Prop({ enum: FINANCE_PROVIDER_ENUM })
  finance_provider?: FINANCE_PROVIDER_ENUM;

  @Prop({ min: 1 })
  emi_duration?: number;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ trim: true, enum: COLOR_ENUM })
  color?: COLOR_ENUM;

  @Prop()
  ram?: number;

  @Prop()
  storage?: number;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
