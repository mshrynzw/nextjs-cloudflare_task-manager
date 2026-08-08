# Task Manager

Next.js + Cloudflare（D1）向けの Task Manager ポートフォリオプロジェクトです。

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS / shadcn
- Zod / React Hook Form / TanStack Query
- Vitest / Playwright
- Drizzle ORM + Cloudflare D1
- Auth.js（Phase 3 予定）

## Prerequisites

- Node.js 20+
- pnpm
- Cloudflare account（`wrangler login` 済み）

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate:local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional local SQLite seed (for scripts/tests tooling):

```bash
pnpm db:seed:local
```

## Database

| Item        | Value                 |
| ----------- | --------------------- |
| Dev D1 name | `task-manager-dev`    |
| Binding     | `DB`                  |
| Schema      | `lib/db/schema/`      |
| Migrations  | `drizzle/migrations/` |

```bash
pnpm db:generate
pnpm db:migrate:local
pnpm db:migrate:remote
```

## Scripts

| Command                  | Purpose                       |
| ------------------------ | ----------------------------- |
| `pnpm dev`               | Local development server      |
| `pnpm lint`              | ESLint                        |
| `pnpm typecheck`         | TypeScript check              |
| `pnpm format`            | Prettier write                |
| `pnpm format:check`      | Prettier check                |
| `pnpm test`              | Vitest unit + integration     |
| `pnpm test:unit`         | Unit tests only               |
| `pnpm test:integration`  | Integration tests only        |
| `pnpm test:e2e`          | Playwright E2E                |
| `pnpm db:generate`       | Generate Drizzle migrations   |
| `pnpm db:migrate:local`  | Apply migrations to local D1  |
| `pnpm db:migrate:remote` | Apply migrations to remote D1 |
| `pnpm db:seed:local`     | Seed local SQLite demo data   |
| `pnpm build`             | Production build              |

First E2E run may require:

```bash
pnpm exec playwright install chromium
```

## Documentation

Canonical docs live under `docs/`.

- `docs/01_requirements.md`
- `docs/04_architecture.md`
- `docs/05_database.md`
- `docs/roadmap.md`
- `docs/development-log.md`

Agent / coding rules:

- `AGENTS.md`
- `.cursor/rules/`

## Git Workflow

- Conventional Commits（`feat:`, `fix:`, `test:`, `docs:` など）
- feature branch で作業し、小さく意味のある commit を積む
- secrets / `.env.local` / build artifacts は commit しない
- 詳細は `.cursor/rules/git.mdc`

## Auth Roadmap

Phase 3 での実装順:

1. GitHub OAuth
2. Google OAuth
3. Email + Password

## Current Status

Phase 4（Backend / API）完了。次は Phase 5（Core Project Management UI）。

### Local Auth Setup

```bash
cp .env.example .env.local
# set AUTH_SECRET (openssl rand -base64 32)
# optionally set GitHub / Google OAuth credentials
pnpm db:seed:local
pnpm dev
```

Demo email user (after seed): `demo@example.com` / `DemoPass123!`
