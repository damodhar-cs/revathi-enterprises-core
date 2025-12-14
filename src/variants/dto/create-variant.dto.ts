import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import {
  ICreateVariantInputDto,
  IVariantAttributesInputDto,
} from "../interface/create-variant.interface";
import { VariantAttributesInputDto } from "./variant-attributes.input.dto";

export class CreateVariantInputDto implements ICreateVariantInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  product_name: string;

  @IsString()
  @IsOptional()
  title?: string; // purely for cms

  @IsString()
  @IsNotEmpty()
  product_uid: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  branch: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  brand: string;

  @IsNumber()
  @Min(0)
  cost_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  selling_price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  supplier?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: "Image must be a valid URL" })
  image?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  warranty?: number; // In years

  @ValidateNested()
  @Type(() => VariantAttributesInputDto)
  @IsOptional()
  attributes?: IVariantAttributesInputDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
