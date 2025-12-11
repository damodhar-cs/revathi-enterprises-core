import { Injectable, Logger, LogLevel } from "@nestjs/common";

export interface LogData {
  message: string;
  context?: string;
  error?: {
    stack?: string;
    message?: string;
    name?: string;
  };
  metadata?: Record<string, any>;
}

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  /**
   * Log general information
   */
  log(data: LogData): void {
    const context = data.context || "Application";
    const logger = new Logger(context);

    const logMessage = this.formatMessage(data);

    if (data.error) {
      logger.error(logMessage);
      if (data.error.stack) {
        logger.error(`Stack trace: ${data.error.stack}`);
      }
    } else {
      logger.log(logMessage);
    }

    if (data.metadata) {
      logger.debug(`Metadata: ${JSON.stringify(data.metadata, null, 2)}`);
    }
  }

  /**
   * Log error with full details
   */
  error(data: LogData): void {
    const context = data.context || "Application";
    const logger = new Logger(context);

    const logMessage = this.formatMessage(data);
    logger.error(logMessage);

    if (data.error) {
      logger.error(`Error name: ${data.error.name || "Error"}`);
      logger.error(
        `Error message: ${JSON.stringify(data.error.message, null, 3) || "Unknown error"}`
      );

      if (data.error.stack) {
        logger.error(`Stack trace:\n${data.error.stack}`);
      }
    }

    if (data.metadata) {
      logger.error(
        `Additional info: ${JSON.stringify(data.metadata, null, 2)}`
      );
    }
  }

  /**
   * Log warning
   */
  warn(data: LogData): void {
    const context = data.context || "Application";
    const logger = new Logger(context);

    const logMessage = this.formatMessage(data);
    logger.warn(logMessage);

    if (data.metadata) {
      logger.debug(`Metadata: ${JSON.stringify(data.metadata, null, 2)}`);
    }
  }

  /**
   * Log debug information
   */
  debug(data: LogData): void {
    const context = data.context || "Application";
    const logger = new Logger(context);

    const logMessage = this.formatMessage(data);
    logger.debug(logMessage);

    if (data.metadata) {
      logger.debug(`Metadata: ${JSON.stringify(data.metadata, null, 2)}`);
    }
  }

  /**
   * Format log message
   */
  private formatMessage(data: LogData): string {
    let message = data.message;

    if (data.error?.message) {
      message += ` | Error: ${data.error.message}`;
    }

    return message;
  }

  /**
   * Log method entry with parameters
   */
  logMethodEntry(
    context: string,
    methodName: string,
    params?: Record<string, any>
  ): void {
    const logger = new Logger(context);
    logger.log(`→ ${methodName} called`);
    if (params && Object.keys(params).length > 0) {
      logger.debug(`Parameters: ${JSON.stringify(params, null, 2)}`);
    }
  }

  /**
   * Log method exit with result
   */
  logMethodExit(
    context: string,
    methodName: string,
    result?: Record<string, any>
  ): void {
    const logger = new Logger(context);
    logger.log(`← ${methodName} completed`);
    if (result && Object.keys(result).length > 0) {
      logger.debug(`Result: ${JSON.stringify(result, null, 2)}`);
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(context: string, method: string, url: string, body?: any): void {
    const logger = new Logger(context);
    logger.log(`📨 ${method} ${url}`);
    if (body && Object.keys(body).length > 0) {
      logger.debug(`Request body: ${JSON.stringify(body, null, 2)}`);
    }
  }

  /**
   * Log HTTP response
   */
  logResponse(
    context: string,
    method: string,
    url: string,
    statusCode: number,
    responseTime?: number
  ): void {
    const logger = new Logger(context);
    const timing = responseTime ? ` | ${responseTime}ms` : "";
    logger.log(`📤 ${method} ${url} → ${statusCode}${timing}`);
  }
}
