import { IBaseVariant } from "../../common/interface/base-variant.interface";

export interface IVariant extends IBaseVariant {
  attributes?: IVariantAttributes;
}

export interface IVariantAttributes {
  color?: string;
  ram?: number;
  storage?: number;
  os?: string;
  processor?: string;
}
