import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
} from "class-validator";
import { Transform } from "class-transformer";
import { COLOR_ENUM } from "../../common/enums/specifications.enum";
import {
  IVariantAttributesInputDto,
  IVariantDimensionsInputDto,
} from "../interface/create-variant.interface";
import { Type } from "class-transformer";

export class VariantAttributesInputDto implements IVariantAttributesInputDto {
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsEnum(COLOR_ENUM, {
    message:
      "Color must be one of the following values: Black, White, Blue, Purple, Pink, Gold, Silver, Green, Red, Yellow",
  })
  color?: COLOR_ENUM;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  size?: string;

  // Mobile-specific
  @IsOptional() // In GB's
  @IsNumber()
  ram?: number;

  @IsOptional() // In GB's
  @IsNumber()
  storage?: number;

  @IsOptional()
  @IsString()
  processor?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @ValidateNested()
  @Type(() => VariantDimensionsInputDto)
  @IsOptional()
  dimensions?: IVariantDimensionsInputDto;

  @IsOptional()
  @IsString()
  screen_size?: string;

  @IsOptional()
  @IsNumber()
  battery_life?: number;

  @IsOptional()
  @IsString()
  material?: string;
}

export class VariantDimensionsInputDto implements IVariantDimensionsInputDto {
  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  depth?: number;
}
