export interface ICreateVariantInputDto {
  product_name: string;
  title?: string;
  product_uid: string;
  description: string;
  sku: string;
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
  weight?: number; // in grams
  size?: string;
  // Mobile-specific
  ram?: number; // in GB's
  storage?: number; // in GB's
  os?: string;
  processor?: string;
  dimensions?: IVariantDimensionsInputDto;
  screen_size?: string;
  battery_life?: number;
  material?: string;
}

export interface IVariantDimensionsInputDto {
  height?: number; // in mm
  width?: number; // in mm
  depth?: number; // in mm
}
