import { OmitType } from "@nestjs/swagger";
import { CreateVariantInputDto } from "./create-variant.dto";

export class UpdateVariantDto extends OmitType(CreateVariantInputDto, [
  "title",
]) {}
