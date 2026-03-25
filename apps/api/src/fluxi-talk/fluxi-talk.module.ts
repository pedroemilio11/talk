import { Module } from "@nestjs/common";
import { PgService } from "./db/pg.service";
import { FluxiTalkController } from "./fluxi-talk.controller";
import { FluxiTalkService } from "./fluxi-talk.service";
import { OpenAiService } from "./integrations/openai.service";
import { ZapiService } from "./integrations/zapi.service";
import { FluxiLoggerService } from "./logs/logger.service";
import { ProtocolService } from "./modules/protocol/protocol.service";
import { RoutingService } from "./modules/routing/routing.service";
import { OrchestratorService } from "./orchestrator/orchestrator.service";
import { RulesEngine } from "./rules/rules.engine";
import { WebhookRateLimitService } from "./rules/webhook-rate-limit.service";
import { StateService } from "./state/state.service";

@Module({
  controllers: [FluxiTalkController],
  providers: [
    PgService,
    StateService,
    RulesEngine,
    WebhookRateLimitService,
    OpenAiService,
    ZapiService,
    ProtocolService,
    RoutingService,
    FluxiLoggerService,
    OrchestratorService,
    FluxiTalkService
  ]
})
export class FluxiTalkModule {}
