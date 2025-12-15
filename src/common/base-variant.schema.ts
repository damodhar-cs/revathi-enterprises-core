import { Prop, Schema } from "@nestjs/mongoose";
import { PRODUCT_TYPE_ENUM } from "./enums/products.enum";
import { PRODUCT_BRANCH_ENUM, PRODUCT_BRAND_ENUM } from "./enums/stores.enum";
import { BaseSchema } from "./base.schema";

@Schema({ timestamps: true })
export class BaseVariant extends BaseSchema {
  @Prop({ required: true, trim: true })
  product_uid: string;

  @Prop({ required: true, trim: true })
  product_name: string; // name  of the product

  /**
   * random uid for cms integration
   * should not be used anywhere
   */
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description?: string;

  @Prop({ unique: true, trim: true })
  imei?: string;

  @Prop({
    required: true,
    enum: [
      PRODUCT_TYPE_ENUM.MOBILE,
      PRODUCT_TYPE_ENUM.ACCESSORIES,
      PRODUCT_TYPE_ENUM.TABLETS,
      PRODUCT_TYPE_ENUM.SMARTWATCHES,
    ],
    trim: true,
  })
  category: PRODUCT_TYPE_ENUM;

  @Prop({
    required: true,
    trim: true,
    enum: [
      PRODUCT_BRANCH_ENUM.MAHADEVAPURA,
      PRODUCT_BRANCH_ENUM.CHENNASANDRA,
      PRODUCT_BRANCH_ENUM.TC_PALYA,
    ],
  })
  branch: PRODUCT_BRANCH_ENUM;

  @Prop({
    required: true,
    trim: true,
    enum: [
      PRODUCT_BRAND_ENUM.Vivo,
      PRODUCT_BRAND_ENUM.Oppo,
      PRODUCT_BRAND_ENUM.Apple,
      PRODUCT_BRAND_ENUM.Samsung,
      PRODUCT_BRAND_ENUM.OnePlus,
      PRODUCT_BRAND_ENUM.Xiaomi,
      PRODUCT_BRAND_ENUM.Redmi,
      PRODUCT_BRAND_ENUM.Realme,
    ],
  })
  brand: PRODUCT_BRAND_ENUM;

  @Prop({ required: true, min: 0 })
  cost_price: number;

  @Prop({ min: 0 })
  selling_price?: number;

  @Prop({ trim: true })
  supplier?: string;

  @Prop({ min: 0 })
  profit_margin?: number;

  @Prop({ required: true, min: 0, default: 0 })
  quantity: number;

  @Prop({ trim: true })
  warranty?: number; // applicable for electronics

  @Prop({ trim: true })
  image?: string;

  @Prop({ trim: true })
  notes?: string;
}
