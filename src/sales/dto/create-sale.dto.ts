import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsEmail,
  ValidateNested,
  IsPhoneNumber,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import {
  ICreateSaleInputDto,
  ICustomerInfo,
} from "../interface/sale.interface";
import { PAYMENT_METHOD_ENUM } from "../../common/enums";
import { COLOR_ENUM } from "src/common/enums/specifications.enum";

export class CustomerInfoDto implements ICustomerInfo {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  pincode?: string;
}

export class CreateSaleInputDto implements ICreateSaleInputDto {
  @IsString()
  @IsNotEmpty()
  variant_uid: string;

  @IsNumber()
  @Min(0.01)
  selling_price: number;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: ICustomerInfo;

  @IsOptional()
  @IsEnum(PAYMENT_METHOD_ENUM)
  payment_method?: PAYMENT_METHOD_ENUM;

  @IsOptional()
  @IsEnum(COLOR_ENUM)
  color?: COLOR_ENUM;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
