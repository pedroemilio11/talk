import { Injectable } from "@nestjs/common";

@Injectable()
export class ProtocolService {
  generate(): string {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `FLX-${date}-${random}`;
  }
}
