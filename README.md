# 🚀 ERP Monorepo - Next.js

Este projeto é um **ERP moderno construído em arquitetura monorepo utilizando Next.js**, com foco em **escalabilidade, modularidade e velocidade de desenvolvimento**.

A proposta é centralizar múltiplos domínios de negócio em um único repositório, permitindo evolução rápida do produto e compartilhamento eficiente de código entre módulos.

---

## 🧩 Principais Módulos

O sistema é estruturado de forma modular, com foco inicial nos seguintes pilares:

- 📦 **Pedidos (Orders)**
  - Gestão de vendas
  - Controle de status de pedidos
  - Histórico e relatórios

- 🛠 **Ordens de Serviço (Service Orders)**
  - Criação e acompanhamento de serviços
  - Gestão de execução e status
  - Registro de atividades e atendimento

> A arquitetura foi pensada para permitir expansão futura com módulos como financeiro, CRM, estoque e relatórios avançados.

---

## 🏗 Arquitetura

- **Monorepo**: organização centralizada para múltiplos módulos e apps
- **Next.js (App Router)**: frontend moderno e performático
- **Arquitetura modular por domínio**
- **Reutilização de código (shared components, hooks e services)**

---

## Base de dados (Prisma)

As migrações **devem ser geradas apenas com o CLI do Prisma** (não criar ficheiros SQL em `prisma/migrations/` à mão).

1. Copie `.env.example` para `.env` e defina `DATABASE_URL` com um PostgreSQL acessível.
2. Crie ou atualize o schema em `prisma/schema.prisma` e execute:

```bash
npx prisma migrate dev --name descricao_curta
# equivalente:
npm run prisma:migrate -- --name descricao_curta
```

Isto cria a pasta `prisma/migrations/<timestamp>_descricao_curta/` com o SQL gerado pelo Prisma e aplica as alterações à base.

- **CI / produção:** `npx prisma migrate deploy` (ou `npm run prisma:deploy`).
- **Cliente gerado:** `npm run prisma:generate` (o `npm run build` também corre `prisma generate` antes do Next).

### Seed (papéis e admin)

Após migrações, opcionalmente:

```bash
npm run prisma:seed
```

Cria os papéis `user` e `admin`. Se definires `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`, cria ou atualiza um utilizador com papel `admin` (username derivado do email ou `ADMIN_USERNAME`).

---

## Autenticação

- **Sessão:** cookie httpOnly `et_session`, token aleatório com hash SHA-256 na tabela `sessions` (30 dias).
- **Password:** Argon2id (`memoryCost` 19456, `timeCost` 2, `parallelism` 1). Política mínima: **8+ caracteres**, pelo menos **uma maiúscula**, **uma minúscula**, **um número** e **um símbolo** (ver `src/domain/auth/auth-types.ts`).
- **API:** `POST /api/auth/register|login|logout`, `GET /api/auth/me`, `POST /api/auth/forgot-password|reset-password|send-verification|verify-email` (validação Zod, rate limit, verificação de `Origin`/`Referer` em mutações quando `NEXT_PUBLIC_APP_URL` está definido).
- **RBAC:** tabelas `roles` e `user_roles`; o cliente recebe `roles: string[]` em `/me`. Autorização em rotas sensíveis deve ser feita no servidor (ex.: `userHasRole` em `src/lib/auth/guards.ts`).
- **Email:** SMTP opcional (`.env.example`). Sem `SMTP_HOST`, o envio é ignorado com aviso em `logService` (útil em desenvolvimento).

---

## ⚙️ Getting Started

A aplicação vive em **`src/app`**. Não mantenhas uma pasta **`app/` vazia na raiz** — o Next.js prioriza a raiz em relação a `src/app` e as rotas deixam de ser encontradas.

Para rodar o projeto localmente:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```
