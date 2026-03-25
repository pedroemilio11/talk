# Talk

Fluxi Talk - sistema operacional de atendimento WhatsApp para Orange Construtora.

## URL ativa

- `https://talk.orange.casa/`
- `https://talk.orange.casa/fluxi-talk/health`

## Principais recursos

- Orchestrator + State Engine + Rule Engine
- Fluxos: cliente, fornecedor, corretor, lead
- Integração webhook Z-API
- Geração de protocolo e roteamento por setor
- Guardrails operacionais (rate limit, limite de mensagens, validações obrigatórias)
- Métricas e auditoria de mensagens

## Estrutura

- `apps/api`: backend NestJS
- `docs/fluxi-talk-mvp.md`: documentação de operação
- `docker-compose.fluxi-talk.yml`: postgres/redis local

## Rodar local

```bash
cd apps/api
corepack pnpm install
corepack pnpm build
node dist/main.js
```
