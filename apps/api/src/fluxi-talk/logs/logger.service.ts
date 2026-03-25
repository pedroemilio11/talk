import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class FluxiLoggerService {
  private readonly logger = new Logger("FluxiTalk");

  event(name: string, payload: Record<string, unknown>) {
    this.logger.log(JSON.stringify({ name, ...payload }));
  }

  warn(name: string, payload: Record<string, unknown>) {
    this.logger.warn(JSON.stringify({ name, ...payload }));
  }
}
