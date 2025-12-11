import {
  PRODUCT_BRANCH_ENUM,
  PRODUCT_BRAND_ENUM,
} from "../../common/enums/stores.enum";
import { BaseInterface } from "../../common/base.interface";
import { PRODUCT_TYPE_ENUM } from "../../common/enums/products.enum";
import { PAYMENT_METHOD_ENUM } from "../../common/enums";
import { COLOR_ENUM } from "src/common/enums/specifications.enum";

export interface ICustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface ISale extends BaseInterface {
  variant_uid: string;
  product_name: string;
  title: string;
  sku: string;
  category: PRODUCT_TYPE_ENUM;
  brand: PRODUCT_BRAND_ENUM;
  branch: PRODUCT_BRANCH_ENUM;
  cost_price: number;
  selling_price: number;
  profit_margin: number;
  customer: ICustomerInfo;
  payment_method?: PAYMENT_METHOD_ENUM;
  receipt_number?: string;
  notes?: string;
  color?: COLOR_ENUM; // Color from variant
  ram?: number; // RAM in GB from variant
  storage?: number; // Storage in GB from variant
}

export interface ICreateSaleInputDto {
  variant_uid: string;
  selling_price: number;
  customer: ICustomerInfo;
  payment_method?: string;
  color?: COLOR_ENUM;
  notes?: string;
}
