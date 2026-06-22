import { IsOptional, IsString, IsObject } from "class-validator";

export interface ISearchSalesInput {
  search?: string;
  brand?: string;
  branch?: string;
  payment_method?: string;
  created_at?: { $gte: string; $lte: string };
  skip?: number;
  limit?: number;
  order?: number;
  sort?: string;
}

export class SearchSalesDto implements ISearchSalesInput {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsObject()
  created_at?: {
    $gte: string;
    $lte: string;
  };

  @IsOptional()
  skip?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsString()
  sort?: string;
}

