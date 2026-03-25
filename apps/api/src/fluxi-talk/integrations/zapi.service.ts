import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ZapiService {
  private readonly logger = new Logger(ZapiService.name);

  async sendText(phone: string, message: string): Promise<void> {
    const sendUrl = process.env.ZAPI_SEND_URL;
    const token = process.env.ZAPI_TOKEN;

    if (!sendUrl) {
      this.logger.log(`[mock-zapi] -> ${phone}: ${message}`);
      return;
    }

    const response = await fetch(sendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { ClientToken: token } : {})
      },
      body: JSON.stringify({
        phone,
        message
      })
    });

    if (!response.ok) {
      const raw = await response.text();
      throw new Error(`Z-API send failed: ${response.status} ${raw.slice(0, 300)}`);
    }
  }
}
