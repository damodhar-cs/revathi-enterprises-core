import { IsNotEmpty, IsObject, IsString, MaxLength } from "class-validator";
import { ICreateProductsInputDto } from "../interface/create-products.interface";
import { Product } from "../schema/product.schema";

export class CreateProductsInputDto implements ICreateProductsInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  brand: string;
}

export class CreateProductResponseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  notice: string;

  @IsObject()
  @IsNotEmpty()
  entry: Product;
}
