import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CMSApiHelperService {
  constructor(private readonly configService: ConfigService) {}

  createOneEntryUrl(contentTypeUid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries`;
    return url;
  }

  updateOneEntryUrl(contentTypeUid: string, entryUid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries/${entryUid}`;
    return url;
  }

  deleteOneEntryUrl(contentTypeUid: string, entryUid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries/${entryUid}`;
    return url;
  }

  getAllEntriesUrl(contentTypeUid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries`;
    return url;
  }

  getOneEntryUrl(contentTypeUid: string, uid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries/${uid}`;
    return url;
  }

  // might need to add entry variant group id for variant related api's
  createOneEntryVariantUrl(contentTypeUid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries`;
    return url;
  }

  updateOneEntryVariantUrl(contentTypeUid: string, entryUid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries/${entryUid}`;
    return url;
  }

  deleteOneEntryVariantUrl(contentTypeUid: string, entryUid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries/${entryUid}`;
    return url;
  }

  getAllEntryVariantsUrl(contentTypeUid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries`;
    return url;
  }

  getOneEntryVariantUrl(contentTypeUid: string, uid: string): string {
    const baseUrl = this.configService.get("CONTENTSTACK_BASE_URL");
    const url = `${baseUrl}/content_types/${contentTypeUid}/entries/${uid}`;
    return url;
  }
}
