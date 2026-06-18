export interface ICreateVariantInputDto {
  product_name: string;
  title?: string;
  product_uid: string;
  description?: string;
  imei?: string;
  category: string;
  branch: string;
  brand: string;
  cost_price: number;
  selling_price?: number;
  supplier?: string;
  image?: string;
  quantity?: number;
  warranty?: number;
  attributes?: IVariantAttributesInputDto;
}

export interface IVariantAttributesInputDto {
  color?: string;
  ram?: number;
  storage?: number;
  os?: string;
  processor?: string;
}
