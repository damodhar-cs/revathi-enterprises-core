import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
} from "class-validator";

export class ExportVariantsDto {
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

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
}
