import { IsNotEmpty, IsObject, IsString, MaxLength } from "class-validator";
import { Product } from "../schema/product.schema";

export class UpdateProductResponseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  notice: string;

  @IsObject()
  @IsNotEmpty()
  entry: Product;
}

export class DeleteProductResponseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  notice: string;
}
