import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { VariantsService } from "./variants.service";
import { CreateVariantInputDto } from "./dto/create-variant.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { SearchVariantsDto } from "./dto/search-variant.dto";
import { ExportVariantsDto } from "./dto/export-variants.dto";
import { MESSAGES } from "../common/constants/messages.constants";

@ApiTags("Variants")
@Controller("variants")
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVariant(@Body() createVariantInputDto: CreateVariantInputDto) {
    const variant = await this.variantsService.create(createVariantInputDto);
    return { message: MESSAGES.VARIANT.CREATED, variant };
  }

  @Post("search")
  search(@Body() searchDto: SearchVariantsDto) {
    return this.variantsService.searchVariants(searchDto);
  }

  @Post("export")
  @HttpCode(HttpStatus.OK)
  async exportVariants(@Body() exportDto: ExportVariantsDto) {
    const filters: any = {};
    if (exportDto.search) filters.search = exportDto.search;
    if (exportDto.category) filters.category = exportDto.category;
    if (exportDto.brand) filters.brand = exportDto.brand;
    if (exportDto.branch) filters.branch = exportDto.branch;
    if (exportDto.created_at) filters.created_at = exportDto.created_at;

    await this.variantsService.exportVariantsToExcel(filters, exportDto.recipientEmail);

    return {
      message: "Variants export has been sent to your email successfully",
      recipientEmail: exportDto.recipientEmail,
    };
  }

  @Get(":uid")
  findOneVariant(@Param("uid") uid: string) {
    return this.variantsService.findOneVariant(uid);
  }

  @Put(":uid")
  async updateVariant(
    @Param("uid") uid: string,
    @Body() updateVariantDto: UpdateVariantDto
  ) {
    const variant = await this.variantsService.updateVariant(uid, updateVariantDto);
    return { message: MESSAGES.VARIANT.UPDATED, variant };
  }

  @Delete(":uid")
  async deleteVariant(@Param("uid") uid: string) {
    await this.variantsService.deleteVariant(uid);
    return { message: MESSAGES.VARIANT.DELETED };
  }
}
