# Fluxi - Playbook do Proximo Sistema

Este playbook define como criar um novo sistema dentro do Fluxi Base, ja com:
- design system minimalista aplicado
- shell padrao
- manifesto de modulo
- integracoes padrao (whatsapp, email, storage)
- permissao inicial configurada no auth mock

## 1. Criar modulo novo

No root do `fluxi/`:

```bash
npm run create:module -- paynow "Fluxi PayNow"
```

Formato:

```bash
npm run create:module -- <id-kebab-case> "<Nome de exibicao>"
```

Exemplo:

```bash
npm run create:module -- creative "Fluxi Creative"
```

## 2. O que o comando faz automaticamente

1. Duplica `modules/module-template` para `modules/<id>`.
2. Ajusta id, nome, permissoes e package name do modulo.
3. Mantem integracoes padrao no manifesto:
   - `whatsapp`
   - `email`
   - `storage`
4. Registra o modulo em `apps/web/src/modules/registry.ts`.
5. Adiciona permissao `<id>.view` ao auth mock em `apps/web/src/lib/auth.ts`.

## 3. Validacao local

```bash
npm run dev
```

Depois acesse:

- `http://localhost:3000/app`
- `http://localhost:3000/app/<id-do-modulo>`

## 4. Checklist de pronto

- Manifesto com `basePath`, `routes`, `menu`, `permissions`, `integrations`.
- Pagina inicial do modulo com layout padrao.
- Permissoes internas do dominio definidas (`<id>.manage`, etc.).
- Integrações ativadas na central (`/app/integracoes`) quando necessario.

## 5. Regra de padrao visual

Todo modulo novo deve herdar o design minimalista global do Fluxi Base:
- sem quadros pesados
- sem sombras de container por padrao
- hierarquia por tipografia, espacamento e sublinhado leve
