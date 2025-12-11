import { IsNotEmpty, IsNumber, IsArray } from "class-validator";
import { Type } from "class-transformer";

export class OutputDto<T> {
  @IsArray()
  @IsNotEmpty()
  @Type(() => Object) // Optional: helps with serialization
  items: T[];

  @IsNumber()
  @IsNotEmpty()
  count: number;
}
