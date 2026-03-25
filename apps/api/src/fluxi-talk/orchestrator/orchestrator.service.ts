import { Injectable } from "@nestjs/common";
import { TRIAGE_MENU } from "../config/fluxi-talk.config";
import { OpenAiService } from "../integrations/openai.service";
import { ZapiService } from "../integrations/zapi.service";
import { FluxiLoggerService } from "../logs/logger.service";
import { ProtocolService } from "../modules/protocol/protocol.service";
import { RoutingService } from "../modules/routing/routing.service";
import { RulesEngine } from "../rules/rules.engine";
import { StateService } from "../state/state.service";
import type { ConversationState } from "../state/state.types";
import { DecisionEngine } from "./decision.engine";

type IncomingMessage = {
  phone: string;
  text: string;
  raw: Record<string, unknown>;
};

@Injectable()
export class OrchestratorService {
  private readonly decisionEngine = new DecisionEngine();

  constructor(
    private readonly stateService: StateService,
    private readonly rulesEngine: RulesEngine,
    private readonly openAiService: OpenAiService,
    private readonly protocolService: ProtocolService,
    private readonly routingService: RoutingService,
    private readonly zapiService: ZapiService,
    private readonly logger: FluxiLoggerService
  ) {}

  async handleIncoming(message: IncomingMessage) {
    let conversation = await this.stateService.getOrCreateConversation(message.phone);

    await this.stateService.incrementMessageCount(conversation.id);
    await this.stateService.saveMessage(conversation.id, "inbound", message.text, {
      source: "zapi-webhook"
    });

    conversation = (await this.stateService.getConversationByPhone(message.phone)) ?? conversation;

    const continuity = this.rulesEngine.canContinue(conversation);

    if (!continuity.allowed) {
      const forcedTransferMessage = `Seu atendimento será transferido para o time humano. Motivo: ${continuity.reason}`;

      const updated = await this.stateService.updateConversation(conversation.id, {
        status: "transferred",
        currentStep: "encerrado",
        transferredTo: "relacionamento"
      });

      await this.sendAndLog(updated, forcedTransferMessage);
      return { conversation: updated, reply: forcedTransferMessage, action: "forced-transfer" };
    }

    const oren = await this.openAiService.runOren({
      step: conversation.currentStep,
      userMessage: message.text,
      allowedActions: ["classificar_usuario", "coletar_dado", "classificar_demanda"],
      history: []
    });

    const decision = this.decisionEngine.decide(conversation, oren.normalizedValue ?? message.text);

    const mergedCollectedData = {
      ...conversation.collectedData,
      ...(decision.updates.collectedData ?? {})
    };

    conversation = await this.stateService.updateConversation(conversation.id, {
      userType: decision.updates.userType,
      currentStep: decision.updates.currentStep,
      status: decision.updates.status,
      intent: decision.updates.intent,
      urgency: decision.updates.urgency,
      demandType: decision.updates.demandType,
      transferredTo: decision.updates.transferredTo,
      protocol: decision.updates.protocol,
      collectedData: mergedCollectedData
    });

    if (decision.finalAction === "register") {
      const protocol = this.protocolService.generate();
      const route = this.routingService.route(conversation.userType, conversation.demandType);

      conversation = await this.stateService.updateConversation(conversation.id, {
        protocol,
        status: "closed",
        currentStep: "encerrado"
      });

      await this.stateService.createTicket({
        conversationId: conversation.id,
        protocol,
        userType: conversation.userType,
        demandType: conversation.demandType,
        urgency: conversation.urgency,
        sector: route.sector,
        payload: {
          phone: conversation.phone,
          ...conversation.collectedData
        }
      });

      const closureValidation = this.rulesEngine.validateClosure(conversation);
      if (!closureValidation.valid) {
        throw new Error(`Closure rule violation: ${closureValidation.reason}`);
      }

      const response = `${decision.reply}\nProtocolo: ${protocol}\nEncaminhado para: ${route.sector}.`;
      await this.sendAndLog(conversation, response);

      this.logger.event("ticket_created", {
        conversationId: conversation.id,
        protocol,
        sector: route.sector
      });

      return {
        conversation,
        reply: response,
        action: "registered"
      };
    }

    if (decision.finalAction === "transfer") {
      const response = `${decision.reply}\nTransferência realizada para: ${conversation.transferredTo ?? "comercial"}.`;
      await this.sendAndLog(conversation, response);

      return { conversation, reply: response, action: "transferred" };
    }

    const mandatory = this.rulesEngine.validateMandatoryData(conversation);
    if (!mandatory.valid && conversation.currentStep === "encerrado") {
      throw new Error(`Mandatory data violation: ${mandatory.reason}`);
    }

    await this.sendAndLog(conversation, decision.reply);
    return { conversation, reply: decision.reply, action: "continued" };
  }

  private async sendAndLog(conversation: ConversationState, reply: string) {
    try {
      await this.zapiService.sendText(conversation.phone, reply);
    } catch (error) {
      this.logger.warn("zapi_send_failed", {
        conversationId: conversation.id,
        phone: conversation.phone,
        reason: (error as Error).message
      });
    }

    await this.stateService.saveMessage(conversation.id, "outbound", reply);

    this.logger.event("message_sent", {
      conversationId: conversation.id,
      phone: conversation.phone,
      step: conversation.currentStep,
      status: conversation.status
    });
  }
}
