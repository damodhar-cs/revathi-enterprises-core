import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseVariant } from "../../common/base-variant.schema";
import { COLOR_ENUM } from "../../common/enums/specifications.enum";
import { IVariant, IVariantAttributes } from "../interface/variants.interface";

export type VariantDocument = Variant & Document;

@Schema({ _id: false }) // prevent creating separate _id for each attributes doc
export class VariantAttributes implements IVariantAttributes {
  @Prop({
    enum: [
      COLOR_ENUM.BLACK,
      COLOR_ENUM.WHITE,
      COLOR_ENUM.BLUE,
      COLOR_ENUM.PURPLE,
      COLOR_ENUM.PINK,
      COLOR_ENUM.GOLD,
      COLOR_ENUM.SILVER,
      COLOR_ENUM.GREEN,
      COLOR_ENUM.RED,
      COLOR_ENUM.YELLOW,
      COLOR_ENUM.BROWN,
    ],
  })
  color?: COLOR_ENUM;

  // Mobile-specific
  @Prop({ required: false }) // In GB's
  ram?: number;

  @Prop({ required: false, trim: true })
  storage?: number;

  @Prop({ required: false, trim: true })
  os?: string;

  @Prop({ required: false, trim: true })
  processor?: string;
}

export const VariantAttributesSchema =
  SchemaFactory.createForClass(VariantAttributes);

@Schema({ timestamps: true })
export class Variant extends BaseVariant implements IVariant {
  @Prop({ type: VariantAttributesSchema })
  attributes?: VariantAttributes;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
