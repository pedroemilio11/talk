export type FluxiUserType = "cliente" | "fornecedor" | "corretor" | "lead" | "unknown";

export type FluxiConversationStep =
  | "triagem"
  | "coleta_nome_cliente"
  | "coleta_demanda_cliente"
  | "coleta_urgencia_cliente"
  | "coleta_empresa_fornecedor"
  | "coleta_cnpj_fornecedor"
  | "coleta_servico_fornecedor"
  | "coleta_empreendimento_fornecedor"
  | "coleta_nome_corretor"
  | "coleta_imobiliaria_corretor"
  | "encaminhamento"
  | "encerrado";

export type FluxiConversationStatus = "active" | "waiting" | "transferred" | "closed";

export type FluxiDemandType =
  | "manutencao"
  | "financeiro"
  | "vistoria"
  | "acompanhamento"
  | "cobranca"
  | "operacional"
  | "comercial"
  | "outro";

export type FluxiUrgency = "baixa" | "media" | "alta" | "critica";

export type FluxiSector =
  | "engenharia"
  | "financeiro"
  | "comercial"
  | "suprimentos"
  | "relacionamento"
  | "operacoes";

export type MessageDirection = "inbound" | "outbound" | "system";

export type CollectedData = {
  nome?: string;
  empresa?: string;
  cnpj?: string;
  servico?: string;
  empreendimento?: string;
  imobiliaria?: string;
  demandaTexto?: string;
};

export type ConversationState = {
  id: string;
  phone: string;
  userType: FluxiUserType;
  currentStep: FluxiConversationStep;
  status: FluxiConversationStatus;
  intent: string | null;
  urgency: FluxiUrgency | null;
  demandType: FluxiDemandType | null;
  messageCount: number;
  collectedData: CollectedData;
  protocol: string | null;
  transferredTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FluxiTicket = {
  id: string;
  conversationId: string;
  protocol: string;
  userType: FluxiUserType;
  demandType: FluxiDemandType | null;
  urgency: FluxiUrgency | null;
  sector: FluxiSector;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type FluxiConversationMessage = {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type FluxiMetrics = {
  totalConversations: number;
  byUserType: Record<FluxiUserType, number>;
  byStatus: Record<FluxiConversationStatus, number>;
  closedWithProtocol: number;
  transferred: number;
  averageMessagesPerConversation: number;
};

export type RouteResolution = {
  sector: FluxiSector;
  reason: string;
};
