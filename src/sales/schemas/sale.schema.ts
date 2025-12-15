import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseSchema } from "../../common/base.schema";
import { PAYMENT_METHOD_ENUM, PRODUCT_BRANCH_ENUM, FINANCE_PROVIDER_ENUM } from "../../common/enums";
import { ISale, ICustomerInfo } from "../interface/sale.interface";
import { PRODUCT_TYPE_ENUM } from "../../common/enums/products.enum";
import { PRODUCT_BRAND_ENUM } from "../../common/enums/stores.enum";
import { COLOR_ENUM } from "../../common/enums/specifications.enum";

export type SaleDocument = Sale & Document;

@Schema({ _id: false }) // prevent creating separate _id for each customer doc
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
  @Prop({ required: true, trim: true })
  variant_uid: string; // Reference to the sold variant

  @Prop({ required: true, trim: true })
  product_name: string; // Reference to the sold variant

  @Prop({ required: true, trim: true })
  title: string; // Denormalized for easy access // mapped to productTitle in cms

  @Prop({ required: true, trim: true })
  imei: string; // Denormalized for easy access

  @Prop({ required: true, enum: PRODUCT_TYPE_ENUM })
  category: PRODUCT_TYPE_ENUM; // Denormalized for easy access

  @Prop({ required: true, trim: true, enum: PRODUCT_BRAND_ENUM })
  brand: PRODUCT_BRAND_ENUM; // Denormalized for easy access

  @Prop({ required: true, enum: PRODUCT_BRANCH_ENUM })
  branch: PRODUCT_BRANCH_ENUM; // Denormalized for easy access

  @Prop({ required: true, min: 0 })
  cost_price: number; // Cost price at time of sale

  @Prop({ required: true, min: 0 })
  selling_price: number; // Actual selling price

  @Prop({ required: true, min: 0 })
  profit_margin: number; // Calculated profit

  @Prop({ type: CustomerInfoSchema, required: true })
  customer: CustomerInfo;

  @Prop({ enum: PAYMENT_METHOD_ENUM })
  payment_method?: PAYMENT_METHOD_ENUM; // Cash, Card, UPI, Finance, etc.

  @Prop({ enum: FINANCE_PROVIDER_ENUM })
  finance_provider?: FINANCE_PROVIDER_ENUM; // Finance provider (if payment_method is Finance)

  @Prop({ min: 1 })
  emi_duration?: number; // EMI duration in months (if payment_method is Finance)

  @Prop({ trim: true, unique: true, sparse: true })
  receipt_number?: string; // Generated receipt number

  @Prop({ trim: true })
  notes?: string; // Additional notes

  // Variant technical specifications for historical record // add this in json type
  @Prop({ trim: true, enum: COLOR_ENUM })
  color?: COLOR_ENUM; // Color from variant

  @Prop()
  ram?: number; // RAM in GB from variant

  @Prop()
  storage?: number; // Storage in GB from variant
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
