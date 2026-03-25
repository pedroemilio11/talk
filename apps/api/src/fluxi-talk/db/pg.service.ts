import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Pool, type QueryResultRow } from "pg";

@Injectable()
export class PgService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PgService.name);
  private readonly pool: Pool | null;
  private readonly enabled: boolean;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const isProduction = process.env.NODE_ENV === "production";
    const allowInMemoryInProd = process.env.FLUXI_ALLOW_IN_MEMORY_PROD === "true";
    const isVercelRuntime = process.env.VERCEL === "1";

    if (connectionString) {
      const useRelaxedSsl =
        connectionString.includes("supabase.com") ||
        connectionString.includes("pooler.supabase.com");

      this.pool = new Pool({
        connectionString,
        ...(useRelaxedSsl ? { ssl: { rejectUnauthorized: false } } : {})
      });
      this.enabled = true;
      return;
    }

    if (isProduction && !allowInMemoryInProd && !isVercelRuntime) {
      throw new Error("DATABASE_URL is required in production for Fluxi Talk");
    }

    this.pool = null;
    this.enabled = false;
  }

  async onModuleInit() {
    if (!this.pool) {
      this.logger.warn("DATABASE_URL not set. Fluxi Talk running in in-memory persistence mode.");
      return;
    }

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS fluxi_conversations (
        id TEXT PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        user_type TEXT NOT NULL DEFAULT 'unknown',
        current_step TEXT NOT NULL DEFAULT 'triagem',
        status TEXT NOT NULL DEFAULT 'active',
        intent TEXT NULL,
        urgency TEXT NULL,
        demand_type TEXT NULL,
        message_count INTEGER NOT NULL DEFAULT 0,
        collected_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        protocol TEXT UNIQUE NULL,
        transferred_to TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS fluxi_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES fluxi_conversations(id) ON DELETE CASCADE,
        direction TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_fluxi_messages_conversation_created
        ON fluxi_messages (conversation_id, created_at);

      CREATE TABLE IF NOT EXISTS fluxi_tickets (
        id TEXT PRIMARY KEY,
        conversation_id TEXT UNIQUE NOT NULL REFERENCES fluxi_conversations(id) ON DELETE CASCADE,
        protocol TEXT UNIQUE NOT NULL,
        user_type TEXT NOT NULL,
        demand_type TEXT NULL,
        urgency TEXT NULL,
        sector TEXT NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS fluxi_inbound_events (
        id TEXT PRIMARY KEY,
        external_id TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    this.logger.log("PostgreSQL ready for Fluxi Talk tables");
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  query<T extends QueryResultRow>(text: string, values?: unknown[]) {
    if (!this.pool) {
      throw new Error("PostgreSQL unavailable: DATABASE_URL not configured");
    }

    return this.pool.query<T>(text, values);
  }

  isAvailable() {
    return this.enabled;
  }
}
