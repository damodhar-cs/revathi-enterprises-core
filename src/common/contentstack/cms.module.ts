import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { CMSApiService } from "./cms-api.service";
import { CMSApiHelperService } from "./cms-api-helper.service";

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [],
  providers: [CMSApiService, CMSApiHelperService],
  exports: [CMSApiService, CMSApiHelperService],
})
export class CMSModule {}
