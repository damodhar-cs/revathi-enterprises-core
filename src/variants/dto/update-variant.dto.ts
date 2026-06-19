import { PartialType } from "@nestjs/swagger";
import { CreateVariantInputDto } from "./create-variant.dto";

export class UpdateVariantDto extends PartialType(CreateVariantInputDto) {}
