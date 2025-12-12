import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from "@nestjs/common";
import { VariantsService } from "./variants.service";
import { CreateVariantInputDto } from "./dto/create-variant.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { SearchVariantsDto } from "./dto/search-variant.dto";

@Controller("variants")
// @UseGuards(JwtAuthGuard)
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  createVariant(@Body() createVariantInputDto: CreateVariantInputDto) {
    return this.variantsService.create(createVariantInputDto);
  }

  @Post("search")
  search(@Body() searchDto: SearchVariantsDto) {
    return this.variantsService.searchVariants(searchDto);
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
