import { Body, Controller, Get, Headers, Ip, Param, Post } from "@nestjs/common";
import { FluxiTalkService } from "./fluxi-talk.service";

@Controller("fluxi-talk")
export class FluxiTalkController {
  constructor(private readonly fluxiTalkService: FluxiTalkService) {}

  @Post("webhook/zapi")
  handleWebhook(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Ip() ip: string
  ) {
    return this.fluxiTalkService.processZapiWebhook(body, headers, ip);
  }

  @Get("conversations/:phone")
  getConversation(@Param("phone") phone: string) {
    return this.fluxiTalkService.getConversation(phone.replace(/\D/g, ""));
  }

  @Get("metrics")
  getMetrics() {
    return this.fluxiTalkService.getMetrics();
  }

  @Get("conversations/:phone/messages")
  getMessages(@Param("phone") phone: string) {
    return this.fluxiTalkService.getConversationMessages(phone.replace(/\D/g, ""));
  }

  @Get("tickets/:protocol")
  getTicketByProtocol(@Param("protocol") protocol: string) {
    return this.fluxiTalkService.getTicketByProtocol(protocol);
  }

  @Get("health")
  health() {
    return {
      service: "fluxi-talk",
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }
}
