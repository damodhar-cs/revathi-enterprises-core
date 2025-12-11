import { Module, Global } from "@nestjs/common";
import { LoggerService } from "./logger.service";

@Global() // Makes the module available globally without needing to import it everywhere
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}

