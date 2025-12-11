import { IBaseVariant } from "../../common/interface/base-variant.interface";

export interface IVariant extends IBaseVariant {
  attributes?: IVariantAttributes;
}

export interface IVariantAttributes {
  color?: string;
  weight?: number;
  size?: string;
  ram?: number;
  storage?: number;
  os?: string;
  processor?: string;
  dimensions?: IVariantDimensions;
  screen_size?: string;
  battery_life?: number; // In Hours
  material?: string;
}

export interface IVariantDimensions {
  height?: number;
  weight?: number;
  depth?: number;
}
