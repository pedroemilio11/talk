# Fluxi Talk

Sistema operacional de atendimento WhatsApp com:

- Orchestrator
- State Engine persistido em PostgreSQL
- Rule Engine com guardrails operacionais
- Integração Webhook Z-API
- Agente Oren via OpenAI (com fallback)
- Registro de protocolo e roteamento

## Variáveis

- `DATABASE_URL` (obrigatória)
- `ZAPI_SEND_URL` (opcional para envio real)
- `ZAPI_TOKEN` (opcional)
- `ZAPI_WEBHOOK_TOKEN` (opcional, valida `x-zapi-token` ou `Authorization: Bearer`)
- `WEBHOOK_RATE_LIMIT_MAX` (opcional, default `60`)
- `WEBHOOK_RATE_LIMIT_WINDOW_MS` (opcional, default `60000`)
- `OPENAI_API_KEY` (opcional)
- `OPENAI_MODEL` (opcional, default `gpt-4o-mini`)

## Hardening de Produção

- Em `NODE_ENV=production`, `DATABASE_URL` é obrigatório (fallback in-memory desabilitado).
- O webhook aplica rate-limit por `ip + phone`.
- Exceção operacional controlada: `FLUXI_ALLOW_IN_MEMORY_PROD=true` libera boot sem banco em produção.

## Endpoints

- `POST /fluxi-talk/webhook/zapi`
- `GET /fluxi-talk/conversations/:phone`
- `GET /fluxi-talk/conversations/:phone/messages`
- `GET /fluxi-talk/tickets/:protocol`
- `GET /fluxi-talk/metrics`
- `GET /fluxi-talk/health`
