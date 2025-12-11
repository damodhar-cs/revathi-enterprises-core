export interface IBaseVariant {
  product_name: string;
  product_uid: string;
  description?: string;
  sku: string;
  category: string;
  branch: string;
  brand: string;
  cost_price: number;
  selling_price?: number;
  supplier?: string;
  profit_margin?: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
  warranty?: number; // applicable for electronics
  image?: string;
}
