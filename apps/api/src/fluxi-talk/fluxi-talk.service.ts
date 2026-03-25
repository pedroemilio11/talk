import { Injectable, UnauthorizedException } from "@nestjs/common";
import { OrchestratorService } from "./orchestrator/orchestrator.service";
import { WebhookRateLimitService } from "./rules/webhook-rate-limit.service";
import { StateService } from "./state/state.service";

type ZapiWebhookRaw = Record<string, unknown>;
type HeaderMap = Record<string, string | string[] | undefined>;

@Injectable()
export class FluxiTalkService {
  constructor(
    private readonly orchestratorService: OrchestratorService,
    private readonly stateService: StateService,
    private readonly webhookRateLimitService: WebhookRateLimitService
  ) {}

  async processZapiWebhook(payload: ZapiWebhookRaw, headers?: HeaderMap, ip?: string) {
    this.validateWebhookToken(headers);

    const parsed = this.parseWebhook(payload);
    const rateLimitKey = `${ip ?? "unknown-ip"}:${parsed.phone ?? "unknown-phone"}`;
    this.webhookRateLimitService.assertAllowed(rateLimitKey);

    if (!parsed.phone || !parsed.text) {
      return {
        accepted: false,
        reason: "payload sem phone/text",
        payload
      };
    }

    if (parsed.externalMessageId) {
      const acceptedEvent = await this.stateService.registerInboundEvent(parsed.externalMessageId);
      if (!acceptedEvent) {
        return {
          accepted: true,
          action: "duplicate_ignored",
          externalMessageId: parsed.externalMessageId
        };
      }
    }

    const result = await this.orchestratorService.handleIncoming({
      phone: parsed.phone,
      text: parsed.text,
      raw: payload
    });

    return {
      accepted: true,
      action: result.action,
      conversationId: result.conversation.id,
      step: result.conversation.currentStep,
      status: result.conversation.status,
      protocol: result.conversation.protocol,
      externalMessageId: parsed.externalMessageId
    };
  }

  getConversation(phone: string) {
    return this.stateService.getConversationByPhone(phone);
  }

  getMetrics() {
    return this.stateService.getMetrics();
  }

  getConversationMessages(phone: string) {
    return this.stateService.getMessagesByPhone(phone);
  }

  getTicketByProtocol(protocol: string) {
    return this.stateService.getTicketByProtocol(protocol);
  }

  private parseWebhook(payload: ZapiWebhookRaw): {
    phone: string | null;
    text: string | null;
    externalMessageId: string | null;
  } {
    const directPhone = this.pickString(payload.phone) ?? this.pickString(payload.sender);
    const nestedData = this.asObject(payload.data);
    const nestedMessage = this.asObject(payload.message);
    const nestedBody = this.asObject(payload.body);

    const phone =
      directPhone ??
      this.pickString(nestedData?.phone) ??
      this.pickString(this.asObject(nestedData?.sender)?.phone) ??
      this.pickString(nestedBody?.phone);

    const text =
      this.pickString(payload.text) ??
      this.pickString(this.asObject(payload.text)?.message) ??
      this.pickString(this.asObject(nestedData?.text)?.message) ??
      this.pickString(nestedMessage?.text) ??
      this.pickString(nestedBody?.message);

    const externalMessageId =
      this.pickString(payload.messageId) ??
      this.pickString(payload.id) ??
      this.pickString(nestedData?.id) ??
      this.pickString(nestedData?.messageId) ??
      this.pickString(nestedMessage?.id) ??
      this.pickString(nestedBody?.id);

    return {
      phone: phone ? phone.replace(/\D/g, "") : null,
      text: text?.trim() ?? null,
      externalMessageId
    };
  }

  private validateWebhookToken(headers?: HeaderMap) {
    const expectedToken = process.env.ZAPI_WEBHOOK_TOKEN?.trim();
    if (!expectedToken) {
      return;
    }

    const tokenFromHeader = this.extractHeader(headers, "x-zapi-token")?.trim();
    const auth = this.extractHeader(headers, "authorization");
    const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;

    const matchesExpected = tokenFromHeader === expectedToken || bearer === expectedToken;
    if (matchesExpected) {
      return;
    }

    throw new UnauthorizedException("Invalid webhook token");
  }

  private extractHeader(headers: HeaderMap | undefined, key: string): string | null {
    if (!headers) {
      return null;
    }

    const raw = headers[key] ?? headers[key.toLowerCase()];
    if (Array.isArray(raw)) {
      return raw[0] ?? null;
    }
    return typeof raw === "string" ? raw : null;
  }

  private pickString(value: unknown): string | null {
    return typeof value === "string" && value.length > 0 ? value : null;
  }

  private asObject(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, unknown>;
  }
}
