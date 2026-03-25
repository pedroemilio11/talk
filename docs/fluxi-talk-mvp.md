# Fluxi Talk MVP

## Escopo entregue

- Orquestrador de atendimento (controle central de fluxo)
- State Engine com persistência em PostgreSQL
- Fallback automático `in-memory` quando `DATABASE_URL` não está definida
- Rule Engine com guardrails:
  - triagem obrigatória
  - limite de 10 mensagens por atendimento
  - encerramento só com protocolo ou transferência
  - validações obrigatórias por perfil
- Fluxos implementados:
  - Cliente: triagem -> nome -> demanda -> urgência -> protocolo -> encaminhamento
  - Fornecedor: triagem -> empresa -> CNPJ -> serviço -> empreendimento -> protocolo -> encaminhamento
  - Corretor: triagem -> nome -> imobiliária -> transferência
  - Lead: triagem -> transferência para comercial
- Integrações:
- webhook de entrada Z-API
- envio de mensagens para Z-API (mock quando `ZAPI_SEND_URL` ausente)
- OpenAI (opcional, com fallback heurístico)
- idempotência por `messageId` de webhook
- autenticação opcional de webhook por token
- Logs estruturados de eventos operacionais

## Endpoints

- `POST /fluxi-talk/webhook/zapi`
- `GET /fluxi-talk/conversations/:phone`
- `GET /fluxi-talk/conversations/:phone/messages`
- `GET /fluxi-talk/tickets/:protocol`
- `GET /fluxi-talk/metrics`
- `GET /fluxi-talk/health`

## Variáveis de ambiente

Arquivo base: `apps/api/.env.example`

- `PORT` (default `3333`)
- `DATABASE_URL` (opcional no dev, obrigatório em produção)
- `ZAPI_SEND_URL` (opcional)
- `ZAPI_TOKEN` (opcional)
- `ZAPI_WEBHOOK_TOKEN` (opcional)
- `WEBHOOK_RATE_LIMIT_MAX` (opcional, default `60`)
- `WEBHOOK_RATE_LIMIT_WINDOW_MS` (opcional, default `60000`)
- `OPENAI_API_KEY` (opcional)
- `OPENAI_MODEL` (opcional, default `gpt-4o-mini`)

## Rodar local

```bash
corepack pnpm --filter @fluxi/api build
PORT=3333 node apps/api/dist/main.js
```

## Smoke test rápido

```bash
corepack pnpm --filter @fluxi/api smoke:fluxi-talk
```

## Observações de produção

- Em `NODE_ENV=production`, `DATABASE_URL` é obrigatório (processo falha sem banco).
- Webhook protegido por rate-limit de janela fixa por `ip + phone`.
- O módulo está preparado para evoluir para fila assíncrona e multi-agentes sem quebrar o contrato HTTP atual.
