import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { VariantsService } from "./variants.service";
import { CreateVariantInputDto } from "./dto/create-variant.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ProductStatusEnum } from "./enums/variants.enum";
import { FindAllVariantsQuery } from "./interface/variants-query.interface";

@Controller("variants")
// @UseGuards(JwtAuthGuard)
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  createVariant(@Body() createVariantInputDto: CreateVariantInputDto) {
    return this.variantsService.create(createVariantInputDto);
  }

  @Get()
  findAllVariants(@Body() input: any) {
    return this.variantsService.findAllVariants(input);
  }

  @Get("aggregated-variants")
  findAllAggregatedProducts(@Query() query: FindAllVariantsQuery) {
    return this.variantsService.findAllVariants(query);
  }

  @Get(":uid")
  findOneVariant(@Param("uid") uid: string) {
    return this.variantsService.findOneVariant(uid);
  }

  @Put(":uid")
  updateVariant(
    @Param("uid") uid: string,
    @Body() updateVariantDto: UpdateVariantDto
  ) {
    return this.variantsService.updateVariant(uid, updateVariantDto);
  }

  @Delete(":uid")
  deleteVariant(@Param("uid") uid: string) {
    return this.variantsService.deleteVariant(uid);
  }
}
