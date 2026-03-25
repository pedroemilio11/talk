import {
  CLIENT_DEMAND_MENU,
  TRIAGE_MENU,
  URGENCY_MENU
} from "../config/fluxi-talk.config";
import type {
  ConversationState,
  FluxiDemandType,
  FluxiUrgency,
  FluxiUserType
} from "../state/state.types";

export type DecisionResult = {
  reply: string;
  updates: Partial<ConversationState> & { collectedData?: Record<string, unknown> };
  finalAction: "continue" | "register" | "transfer" | "close";
};

export class DecisionEngine {
  decide(conversation: ConversationState, inputMessage: string): DecisionResult {
    const message = inputMessage.trim();

    switch (conversation.currentStep) {
      case "triagem":
        return this.handleTriagem(conversation, message);
      case "coleta_nome_cliente":
        return {
          reply: CLIENT_DEMAND_MENU,
          updates: {
            currentStep: "coleta_demanda_cliente",
            collectedData: {
              ...conversation.collectedData,
              nome: message
            }
          },
          finalAction: "continue"
        };
      case "coleta_demanda_cliente": {
        const demand = this.parseDemand(message);
        if (!demand) {
          return {
            reply: `Não identifiquei a demanda.\n${CLIENT_DEMAND_MENU}`,
            updates: {},
            finalAction: "continue"
          };
        }

        return {
          reply: URGENCY_MENU,
          updates: {
            demandType: demand,
            currentStep: "coleta_urgencia_cliente",
            collectedData: {
              ...conversation.collectedData,
              demandaTexto: message
            }
          },
          finalAction: "continue"
        };
      }
      case "coleta_urgencia_cliente": {
        const urgency = this.parseUrgency(message);
        if (!urgency) {
          return {
            reply: `Não identifiquei a urgência.\n${URGENCY_MENU}`,
            updates: {},
            finalAction: "continue"
          };
        }

        return {
          reply: "Perfeito. Vou registrar seu atendimento e gerar protocolo.",
          updates: {
            urgency,
            currentStep: "encaminhamento"
          },
          finalAction: "register"
        };
      }
      case "coleta_empresa_fornecedor":
        return {
          reply: "Informe o CNPJ da empresa (somente números ou formato completo).",
          updates: {
            currentStep: "coleta_cnpj_fornecedor",
            collectedData: {
              ...conversation.collectedData,
              empresa: message
            }
          },
          finalAction: "continue"
        };
      case "coleta_cnpj_fornecedor": {
        const normalizedCnpj = this.normalizeCnpj(message);
        if (!normalizedCnpj) {
          return {
            reply: "CNPJ inválido. Envie novamente com 14 dígitos.",
            updates: {},
            finalAction: "continue"
          };
        }

        return {
          reply: "Qual serviço/assunto você precisa tratar?",
          updates: {
            currentStep: "coleta_servico_fornecedor",
            collectedData: {
              ...conversation.collectedData,
              cnpj: normalizedCnpj
            }
          },
          finalAction: "continue"
        };
      }
      case "coleta_servico_fornecedor":
        return {
          reply: "Informe o empreendimento relacionado.",
          updates: {
            currentStep: "coleta_empreendimento_fornecedor",
            collectedData: {
              ...conversation.collectedData,
              servico: message
            }
          },
          finalAction: "continue"
        };
      case "coleta_empreendimento_fornecedor":
        return {
          reply: "Dados recebidos. Vou registrar e encaminhar para Suprimentos.",
          updates: {
            currentStep: "encaminhamento",
            demandType: "operacional",
            urgency: "media",
            collectedData: {
              ...conversation.collectedData,
              empreendimento: message
            }
          },
          finalAction: "register"
        };
      case "coleta_nome_corretor":
        return {
          reply: "Informe a imobiliária para seguir com a transferência imediata.",
          updates: {
            currentStep: "coleta_imobiliaria_corretor",
            collectedData: {
              ...conversation.collectedData,
              nome: message
            }
          },
          finalAction: "continue"
        };
      case "coleta_imobiliaria_corretor":
        return {
          reply: "Obrigado. Vou transferir seu atendimento para o Comercial agora.",
          updates: {
            currentStep: "encerrado",
            status: "transferred",
            transferredTo: "comercial",
            collectedData: {
              ...conversation.collectedData,
              imobiliaria: message
            }
          },
          finalAction: "transfer"
        };
      case "encerrado":
        return {
          reply: "Esse atendimento já foi finalizado. Se precisar, envie uma nova mensagem para abrir outro protocolo.",
          updates: {},
          finalAction: "close"
        };
      default:
        return {
          reply: TRIAGE_MENU,
          updates: { currentStep: "triagem" },
          finalAction: "continue"
        };
    }
  }

  private handleTriagem(conversation: ConversationState, message: string): DecisionResult {
    const userType = this.parseUserType(message);

    if (!userType) {
      return {
        reply: TRIAGE_MENU,
        updates: { currentStep: "triagem" },
        finalAction: "continue"
      };
    }

    if (userType === "cliente") {
      return {
        reply: "Por favor, informe seu nome completo.",
        updates: {
          userType,
          currentStep: "coleta_nome_cliente"
        },
        finalAction: "continue"
      };
    }

    if (userType === "fornecedor") {
      return {
        reply: "Informe o nome da empresa/prestador.",
        updates: {
          userType,
          currentStep: "coleta_empresa_fornecedor"
        },
        finalAction: "continue"
      };
    }

    if (userType === "corretor") {
      return {
        reply: "Informe seu nome para transferência ao time comercial.",
        updates: {
          userType,
          currentStep: "coleta_nome_corretor"
        },
        finalAction: "continue"
      };
    }

    return {
      reply: "Perfeito. Vou transferir seu contato para o time Comercial (Mel).",
      updates: {
        userType,
        currentStep: "encerrado",
        status: "transferred",
        transferredTo: "comercial",
        demandType: "comercial"
      },
      finalAction: "transfer"
    };
  }

  private parseUserType(raw: string): FluxiUserType | null {
    const normalized = raw.toLowerCase();

    if (["1", "cliente", "sou cliente"].some((token) => normalized.includes(token))) {
      return "cliente";
    }

    if (["2", "fornecedor", "prestador"].some((token) => normalized.includes(token))) {
      return "fornecedor";
    }

    if (["3", "corretor"].some((token) => normalized.includes(token))) {
      return "corretor";
    }

    if (["4", "lead", "interessado", "quero comprar"].some((token) => normalized.includes(token))) {
      return "lead";
    }

    return null;
  }

  private parseDemand(raw: string): FluxiDemandType | null {
    const normalized = raw.toLowerCase();

    if (["1", "manutenção", "manutencao"].some((token) => normalized.includes(token))) {
      return "manutencao";
    }

    if (["2", "financeiro", "boleto", "pagamento"].some((token) => normalized.includes(token))) {
      return "financeiro";
    }

    if (["3", "vistoria"].some((token) => normalized.includes(token))) {
      return "vistoria";
    }

    if (["4", "acompanhamento", "obra"].some((token) => normalized.includes(token))) {
      return "acompanhamento";
    }

    return null;
  }

  private parseUrgency(raw: string): FluxiUrgency | null {
    const normalized = raw.toLowerCase();

    if (["1", "baixa"].some((token) => normalized.includes(token))) {
      return "baixa";
    }

    if (["2", "media", "média"].some((token) => normalized.includes(token))) {
      return "media";
    }

    if (["3", "alta"].some((token) => normalized.includes(token))) {
      return "alta";
    }

    if (["4", "critica", "crítica"].some((token) => normalized.includes(token))) {
      return "critica";
    }

    return null;
  }

  private normalizeCnpj(raw: string): string | null {
    const digits = raw.replace(/\D/g, "");
    return digits.length === 14 ? digits : null;
  }
}
