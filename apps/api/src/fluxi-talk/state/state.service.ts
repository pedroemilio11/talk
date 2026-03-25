import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PgService } from "../db/pg.service";
import type {
  ConversationState,
  FluxiDemandType,
  FluxiConversationMessage,
  FluxiMetrics,
  FluxiTicket,
  FluxiUrgency,
  FluxiUserType,
  MessageDirection
} from "./state.types";

type ConversationRow = {
  id: string;
  phone: string;
  user_type: FluxiUserType;
  current_step: ConversationState["currentStep"];
  status: ConversationState["status"];
  intent: string | null;
  urgency: FluxiUrgency | null;
  demand_type: FluxiDemandType | null;
  message_count: number;
  collected_data: Record<string, unknown>;
  protocol: string | null;
  transferred_to: string | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class StateService {
  private readonly memoryConversations = new Map<string, ConversationState>();
  private readonly memoryConversationsByPhone = new Map<string, string>();
  private readonly memoryTickets = new Map<string, FluxiTicket>();
  private readonly memoryMessagesByConversation = new Map<string, FluxiConversationMessage[]>();
  private readonly memoryInboundEvents = new Set<string>();

  constructor(private readonly pg: PgService) {}

  async getOrCreateConversation(phone: string): Promise<ConversationState> {
    if (!this.pg.isAvailable()) {
      return this.getOrCreateInMemory(phone);
    }

    const existing = await this.pg.query<ConversationRow>(
      `SELECT * FROM fluxi_conversations WHERE phone = $1 LIMIT 1`,
      [phone]
    );

    if (existing.rowCount && existing.rows[0]) {
      return this.mapConversation(existing.rows[0]);
    }

    const id = randomUUID();
    const inserted = await this.pg.query<ConversationRow>(
      `
      INSERT INTO fluxi_conversations (id, phone)
      VALUES ($1, $2)
      RETURNING *
    `,
      [id, phone]
    );

    return this.mapConversation(inserted.rows[0]!);
  }

  async incrementMessageCount(conversationId: string): Promise<number> {
    if (!this.pg.isAvailable()) {
      const conversation = this.memoryConversations.get(conversationId);
      if (!conversation) {
        return 0;
      }

      conversation.messageCount += 1;
      conversation.updatedAt = new Date().toISOString();
      this.memoryConversations.set(conversationId, conversation);
      return conversation.messageCount;
    }

    const result = await this.pg.query<{ message_count: number }>(
      `
      UPDATE fluxi_conversations
      SET message_count = message_count + 1,
          updated_at = NOW()
      WHERE id = $1
      RETURNING message_count
    `,
      [conversationId]
    );

    return result.rows[0]?.message_count ?? 0;
  }

  async saveMessage(
    conversationId: string,
    direction: MessageDirection,
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.pg.isAvailable()) {
      const list = this.memoryMessagesByConversation.get(conversationId) ?? [];
      list.push({
        id: randomUUID(),
        conversationId,
        direction,
        content,
        metadata,
        createdAt: new Date().toISOString()
      });
      this.memoryMessagesByConversation.set(conversationId, list);
      return;
    }

    await this.pg.query(
      `
      INSERT INTO fluxi_messages (id, conversation_id, direction, content, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [randomUUID(), conversationId, direction, content, metadata ? JSON.stringify(metadata) : null]
    );
  }

  async updateConversation(
    conversationId: string,
    patch: Partial<
      Pick<
        ConversationState,
        "userType" | "currentStep" | "status" | "intent" | "urgency" | "demandType" | "protocol" | "transferredTo"
      > & { collectedData: Record<string, unknown> }
    >
  ): Promise<ConversationState> {
    if (!this.pg.isAvailable()) {
      const current = this.memoryConversations.get(conversationId);
      if (!current) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      const updated: ConversationState = {
        ...current,
        userType: patch.userType ?? current.userType,
        currentStep: patch.currentStep ?? current.currentStep,
        status: patch.status ?? current.status,
        intent: patch.intent ?? current.intent,
        urgency: patch.urgency ?? current.urgency,
        demandType: patch.demandType ?? current.demandType,
        protocol: patch.protocol ?? current.protocol,
        transferredTo: patch.transferredTo ?? current.transferredTo,
        collectedData: patch.collectedData ?? current.collectedData,
        updatedAt: new Date().toISOString()
      };

      this.memoryConversations.set(conversationId, updated);
      this.memoryConversationsByPhone.set(updated.phone, updated.id);
      return updated;
    }

    const current = await this.pg.query<ConversationRow>(
      `SELECT * FROM fluxi_conversations WHERE id = $1 LIMIT 1`,
      [conversationId]
    );

    const row = current.rows[0];
    if (!row) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const collectedData = patch.collectedData ?? row.collected_data;

    const updated = await this.pg.query<ConversationRow>(
      `
      UPDATE fluxi_conversations
      SET user_type = $2,
          current_step = $3,
          status = $4,
          intent = $5,
          urgency = $6,
          demand_type = $7,
          protocol = $8,
          transferred_to = $9,
          collected_data = $10,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [
        conversationId,
        patch.userType ?? row.user_type,
        patch.currentStep ?? row.current_step,
        patch.status ?? row.status,
        patch.intent ?? row.intent,
        patch.urgency ?? row.urgency,
        patch.demandType ?? row.demand_type,
        patch.protocol ?? row.protocol,
        patch.transferredTo ?? row.transferred_to,
        JSON.stringify(collectedData)
      ]
    );

    return this.mapConversation(updated.rows[0]!);
  }

  async createTicket(input: {
    conversationId: string;
    protocol: string;
    userType: FluxiUserType;
    demandType: FluxiDemandType | null;
    urgency: FluxiUrgency | null;
    sector: string;
    payload: Record<string, unknown>;
  }): Promise<FluxiTicket> {
    if (!this.pg.isAvailable()) {
      const ticket: FluxiTicket = {
        id: randomUUID(),
        conversationId: input.conversationId,
        protocol: input.protocol,
        userType: input.userType,
        demandType: input.demandType,
        urgency: input.urgency,
        sector: input.sector as FluxiTicket["sector"],
        payload: input.payload,
        createdAt: new Date().toISOString()
      };

      this.memoryTickets.set(ticket.id, ticket);
      return ticket;
    }

    const result = await this.pg.query<{
      id: string;
      conversation_id: string;
      protocol: string;
      user_type: FluxiUserType;
      demand_type: FluxiDemandType | null;
      urgency: FluxiUrgency | null;
      sector: string;
      payload: Record<string, unknown>;
      created_at: Date;
    }>(
      `
      INSERT INTO fluxi_tickets (
        id, conversation_id, protocol, user_type, demand_type, urgency, sector, payload
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        randomUUID(),
        input.conversationId,
        input.protocol,
        input.userType,
        input.demandType,
        input.urgency,
        input.sector,
        JSON.stringify(input.payload)
      ]
    );

    const row = result.rows[0]!;

    return {
      id: row.id,
      conversationId: row.conversation_id,
      protocol: row.protocol,
      userType: row.user_type,
      demandType: row.demand_type,
      urgency: row.urgency,
      sector: row.sector as FluxiTicket["sector"],
      payload: row.payload,
      createdAt: row.created_at.toISOString()
    };
  }

  async getConversationByPhone(phone: string): Promise<ConversationState | null> {
    if (!this.pg.isAvailable()) {
      const id = this.memoryConversationsByPhone.get(phone);
      if (!id) {
        return null;
      }

      return this.memoryConversations.get(id) ?? null;
    }

    const found = await this.pg.query<ConversationRow>(
      `SELECT * FROM fluxi_conversations WHERE phone = $1 LIMIT 1`,
      [phone]
    );

    const row = found.rows[0];
    return row ? this.mapConversation(row) : null;
  }

  async getMessagesByPhone(phone: string): Promise<FluxiConversationMessage[]> {
    const conversation = await this.getConversationByPhone(phone);
    if (!conversation) {
      return [];
    }

    if (!this.pg.isAvailable()) {
      return this.memoryMessagesByConversation.get(conversation.id) ?? [];
    }

    const messages = await this.pg.query<{
      id: string;
      conversation_id: string;
      direction: MessageDirection;
      content: string;
      metadata: Record<string, unknown> | null;
      created_at: Date;
    }>(
      `
      SELECT id, conversation_id, direction, content, metadata, created_at
      FROM fluxi_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `,
      [conversation.id]
    );

    return messages.rows.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      direction: row.direction,
      content: row.content,
      metadata: row.metadata ?? undefined,
      createdAt: row.created_at.toISOString()
    }));
  }

  async getTicketByProtocol(protocol: string): Promise<FluxiTicket | null> {
    if (!this.pg.isAvailable()) {
      for (const ticket of this.memoryTickets.values()) {
        if (ticket.protocol === protocol) {
          return ticket;
        }
      }
      return null;
    }

    const found = await this.pg.query<{
      id: string;
      conversation_id: string;
      protocol: string;
      user_type: FluxiUserType;
      demand_type: FluxiDemandType | null;
      urgency: FluxiUrgency | null;
      sector: string;
      payload: Record<string, unknown>;
      created_at: Date;
    }>(
      `
      SELECT id, conversation_id, protocol, user_type, demand_type, urgency, sector, payload, created_at
      FROM fluxi_tickets
      WHERE protocol = $1
      LIMIT 1
    `,
      [protocol]
    );

    const row = found.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      conversationId: row.conversation_id,
      protocol: row.protocol,
      userType: row.user_type,
      demandType: row.demand_type,
      urgency: row.urgency,
      sector: row.sector as FluxiTicket["sector"],
      payload: row.payload,
      createdAt: row.created_at.toISOString()
    };
  }

  async registerInboundEvent(externalId: string): Promise<boolean> {
    if (!externalId) {
      return true;
    }

    if (!this.pg.isAvailable()) {
      if (this.memoryInboundEvents.has(externalId)) {
        return false;
      }
      this.memoryInboundEvents.add(externalId);
      return true;
    }

    try {
      await this.pg.query(
        `
        INSERT INTO fluxi_inbound_events (id, external_id)
        VALUES ($1, $2)
      `,
        [randomUUID(), externalId]
      );
      return true;
    } catch (error) {
      const message = (error as Error).message.toLowerCase();
      if (message.includes("duplicate") || message.includes("unique")) {
        return false;
      }
      throw error;
    }
  }

  async getMetrics(): Promise<FluxiMetrics> {
    if (!this.pg.isAvailable()) {
      return this.computeMetrics(Array.from(this.memoryConversations.values()));
    }

    const result = await this.pg.query<ConversationRow>(`SELECT * FROM fluxi_conversations`);
    return this.computeMetrics(result.rows.map((row) => this.mapConversation(row)));
  }

  private getOrCreateInMemory(phone: string): ConversationState {
    const existingId = this.memoryConversationsByPhone.get(phone);
    if (existingId) {
      const existing = this.memoryConversations.get(existingId);
      if (existing) {
        return existing;
      }
    }

    const now = new Date().toISOString();
    const conversation: ConversationState = {
      id: randomUUID(),
      phone,
      userType: "unknown",
      currentStep: "triagem",
      status: "active",
      intent: null,
      urgency: null,
      demandType: null,
      messageCount: 0,
      collectedData: {},
      protocol: null,
      transferredTo: null,
      createdAt: now,
      updatedAt: now
    };

    this.memoryConversations.set(conversation.id, conversation);
    this.memoryConversationsByPhone.set(phone, conversation.id);

    return conversation;
  }

  private mapConversation(row: ConversationRow): ConversationState {
    return {
      id: row.id,
      phone: row.phone,
      userType: row.user_type,
      currentStep: row.current_step,
      status: row.status,
      intent: row.intent,
      urgency: row.urgency,
      demandType: row.demand_type,
      messageCount: row.message_count,
      collectedData: row.collected_data,
      protocol: row.protocol,
      transferredTo: row.transferred_to,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    };
  }

  private computeMetrics(conversations: ConversationState[]): FluxiMetrics {
    const byUserType: FluxiMetrics["byUserType"] = {
      cliente: 0,
      fornecedor: 0,
      corretor: 0,
      lead: 0,
      unknown: 0
    };

    const byStatus: FluxiMetrics["byStatus"] = {
      active: 0,
      waiting: 0,
      transferred: 0,
      closed: 0
    };

    let closedWithProtocol = 0;
    let transferred = 0;
    let totalMessages = 0;

    for (const conversation of conversations) {
      byUserType[conversation.userType] += 1;
      byStatus[conversation.status] += 1;
      totalMessages += conversation.messageCount;

      if (conversation.protocol) {
        closedWithProtocol += 1;
      }

      if (conversation.status === "transferred" || conversation.transferredTo) {
        transferred += 1;
      }
    }

    return {
      totalConversations: conversations.length,
      byUserType,
      byStatus,
      closedWithProtocol,
      transferred,
      averageMessagesPerConversation:
        conversations.length > 0 ? Number((totalMessages / conversations.length).toFixed(2)) : 0
    };
  }
}
