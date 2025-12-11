import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import {
  DEFAULT_LOCALE,
  INCLUDE_PUBLISH_DETAILS,
} from "../constants/app.constants";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class CMSApiService {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService
  ) {}

  async getAllEntries(input: any) {
    try {
      const { url, body } = input;

      const queryParams = {
        locale: DEFAULT_LOCALE,
        include_publish_details: INCLUDE_PUBLISH_DETAILS,
        include_count: true,
      };

      const headers = {
        api_key: this.configService.get("STACK_API_KEY"),
        authorization: this.configService.get("MANAGEMENT_TOKEN"),
        branch: this.configService.get("BRANCH"),
        "content-type": "application/json",
      };

      const response = await firstValueFrom(
        this.http.get(url, {
          params: queryParams,
          headers,
          data: body,
        })
      );

      const formattedResponse = response?.data;
      return {
        items: formattedResponse?.entries,
        count: formattedResponse?.count,
      };
    } catch (error) {
      this.loggerService.error({
        message: "Error while using get api from cs",
        context: "CMSApiService",
        error: {
          message: error?.response?.data,
        },
      });
      throw error;
    }
  }

  async getEntry(input: any) {
    try {
      const { url } = input;

      const queryParams = {
        locale: DEFAULT_LOCALE,
        include_publish_details: INCLUDE_PUBLISH_DETAILS,
      };

      const headers = {
        api_key: this.configService.get("STACK_API_KEY"),
        authorization: this.configService.get("MANAGEMENT_TOKEN"),
        branch: this.configService.get("BRANCH"),
        "content-type": "application/json",
      };

      const response = await firstValueFrom(
        this.http.get(url, {
          params: queryParams,
          headers,
        })
      );

      return response?.data?.entry;
    } catch (error) {
      this.loggerService.error({
        message: "Error while using get api from cs",
        context: "CMSApiService",
        error: {
          message: error?.response?.data,
        },
      });
      throw error;
    }
  }

  async createEntry(input: any) {
    try {
      const { url, data } = input;

      const queryParams = {
        locale: DEFAULT_LOCALE,
      };

      const headers = {
        api_key: this.configService.get("STACK_API_KEY"),
        authorization: this.configService.get("MANAGEMENT_TOKEN"),
        branch: this.configService.get("BRANCH"),
        "content-type": "application/json",
      };

      const response = await firstValueFrom(
        this.http.post(url, data, { headers, params: queryParams })
      );

      return response?.data;
    } catch (error) {
      this.loggerService.error({
        message: "Error while using create api from cs",
        context: "CMSApiService",
        error: {
          message: error?.response?.data,
        },
      });
      throw error;
    }
  }

  async updateEntry(input: any) {
    try {
      const { url, data } = input;

      const queryParams = {
        locale: DEFAULT_LOCALE,
      };

      const headers = {
        api_key: this.configService.get("STACK_API_KEY"),
        authorization: this.configService.get("MANAGEMENT_TOKEN"),
        branch: this.configService.get("BRANCH"),
        "content-type": "application/json",
      };

      const response = await firstValueFrom(
        this.http.put(url, data, { headers, params: queryParams })
      );

      return response?.data;
    } catch (error) {
      this.loggerService.error({
        message: "Error while using create api from cs",
        context: "CMSApiService",
        error: {
          message: error?.response?.data,
        },
      });
      throw error;
    }
  }

  async deleteEntry(input: any) {
    try {
      const { url } = input;

      const queryParams = {
        locale: DEFAULT_LOCALE,
      };

      const headers = {
        api_key: this.configService.get("STACK_API_KEY"),
        authorization: this.configService.get("MANAGEMENT_TOKEN"),
        branch: this.configService.get("BRANCH"),
        "content-type": "application/json",
      };

      const response = await firstValueFrom(
        this.http.delete(url, { headers, params: queryParams })
      );

      return response?.data;
    } catch (error) {
      this.loggerService.error({
        message: "Error while using create api from cs",
        context: "CMSApiService",
        error: {
          message: error?.response?.data,
        },
      });
      throw error;
    }
  }
}
