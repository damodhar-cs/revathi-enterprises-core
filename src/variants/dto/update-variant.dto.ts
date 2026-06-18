import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateVariantInputDto } from "./create-variant.dto";

export class UpdateVariantDto extends PartialType(
  OmitType(CreateVariantInputDto, ["title"] as const)
) {}
