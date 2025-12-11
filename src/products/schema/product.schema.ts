import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseSchema } from "../../common/base.schema";
import { PRODUCT_TYPE_ENUM } from "../../common/enums/products.enum";

@Schema({ timestamps: true })
export class Product extends BaseSchema {
  @Prop({ required: true, trim: true })
  title: string;

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
  category: string;

  @Prop({ required: true, trim: true })
  brand: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = Product & Document;
