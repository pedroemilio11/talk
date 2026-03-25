import { Injectable } from "@nestjs/common";
import { FLUXI_MAX_MESSAGES_PER_ATTENDANCE } from "../config/fluxi-talk.config";
import type { ConversationState } from "../state/state.types";

@Injectable()
export class RulesEngine {
  canContinue(conversation: ConversationState): { allowed: boolean; reason?: string } {
    if (conversation.messageCount >= FLUXI_MAX_MESSAGES_PER_ATTENDANCE) {
      return {
        allowed: false,
        reason: "Limite de mensagens do atendimento atingido. Transferência para time humano obrigatória."
      };
    }

    if (conversation.status === "closed") {
      return { allowed: false, reason: "Atendimento já encerrado" };
    }

    return { allowed: true };
  }

  validateClosure(conversation: ConversationState): { valid: boolean; reason?: string } {
    const hasProtocol = Boolean(conversation.protocol);
    const hasTransfer = Boolean(conversation.transferredTo);

    if (!hasProtocol && !hasTransfer) {
      return {
        valid: false,
        reason: "Encerramento inválido: precisa de protocolo ou transferência"
      };
    }

    return { valid: true };
  }

  validateMandatoryData(conversation: ConversationState): { valid: boolean; reason?: string } {
    if (conversation.userType === "cliente" && !conversation.collectedData.nome) {
      return { valid: false, reason: "Nome é obrigatório para cliente" };
    }

    if (conversation.userType === "fornecedor" && !conversation.collectedData.cnpj) {
      return { valid: false, reason: "CNPJ é obrigatório para fornecedor" };
    }

    return { valid: true };
  }
}
