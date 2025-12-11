import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseVariant } from "../../common/base-variant.schema";
import { COLOR_ENUM } from "../../common/enums/specifications.enum";
import {
  IVariant,
  IVariantAttributes,
  IVariantDimensions,
} from "../interface/variants.interface";

export type VariantDocument = Variant & Document;

@Schema({ _id: false }) // prevent creating separate _id for each dimensions doc
export class VariantDimensions implements IVariantDimensions {
  @Prop({ required: false, trim: true }) // in mm
  height?: number;

  @Prop({ required: false, trim: true }) // in mm
  width?: number;

  @Prop({ required: false, trim: true }) // in mm
  depth?: number;
}

export const VariantDimensionsSchema =
  SchemaFactory.createForClass(VariantDimensions);

@Schema({ _id: false }) // prevent creating separate _id for each attributes doc
export class VariantAttributes implements IVariantAttributes {
  // Common attributes
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
    ],
  })
  color?: COLOR_ENUM;

  @Prop({ required: false, trim: true })
  weight?: number;

  @Prop({ required: false, trim: true })
  size?: string;

  // Mobile-specific
  @Prop({ required: false }) // In GB's
  ram?: number;

  @Prop({ required: false, trim: true })
  storage?: number;

  @Prop({ required: false, trim: true })
  os?: string;

  @Prop({ required: false, trim: true })
  processor?: string;

  @Prop({ type: VariantDimensionsSchema })
  dimensions?: VariantDimensions;

  @Prop({ required: false, trim: true })
  screen_size?: string;

  @Prop({ required: false, trim: true }) // In hours
  battery_life?: number;

  @Prop({ required: false, trim: true })
  material?: string;
}

export const VariantAttributesSchema =
  SchemaFactory.createForClass(VariantAttributes);

@Schema({ timestamps: true })
export class Variant extends BaseVariant implements IVariant {
  @Prop({ type: VariantAttributesSchema })
  attributes?: VariantAttributes;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
