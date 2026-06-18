import { IsOptional, IsString, IsEnum, IsNumber } from "class-validator";
import { Transform } from "class-transformer";
import { COLOR_ENUM } from "../../common/enums/specifications.enum";
import { IVariantAttributesInputDto } from "../interface/create-variant.interface";

export class VariantAttributesInputDto implements IVariantAttributesInputDto {
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsEnum(COLOR_ENUM, {
    message:
      "Color must be one of the following values: Black, White, Blue, Purple, Pink, Gold, Silver, Green, Red, Yellow, Brown",
  })
  color?: COLOR_ENUM;

  // Mobile-specific
  @IsOptional()
  @IsNumber()
  ram?: number;

  @IsOptional()
  @IsNumber()
  storage?: number;

  @IsOptional()
  @IsString()
  processor?: string;

  @IsOptional()
  @IsString()
  os?: string;
}
