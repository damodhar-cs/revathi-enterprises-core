import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { VariantsService } from "./variants.service";
import { CreateVariantInputDto } from "./dto/create-variant.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { SearchVariantsDto } from "./dto/search-variant.dto";

@ApiTags("Variants")
@Controller("variants")
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
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
