import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ExportSalesDto {
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

