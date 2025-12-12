import { IsOptional, IsString, IsObject } from "class-validator";

export class SearchSalesDto {
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

