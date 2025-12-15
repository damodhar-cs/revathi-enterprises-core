import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
} from "class-validator";

export class ExportSalesDto {
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsObject()
  created_at?: {
    $gte: string;
    $lte: string;
  };
}
