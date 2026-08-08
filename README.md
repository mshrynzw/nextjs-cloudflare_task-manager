# Task Manager

Next.js + Cloudflare（D1）向けの Task Manager ポートフォリオプロジェクトです。

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS / shadcn
- Zod / React Hook Form / TanStack Query
- Vitest / Playwright
- Auth.js（予定） / Drizzle + Cloudflare D1（予定）

## Prerequisites

- Node.js 20+
- pnpm
- Cloudflare account（Phase 2 以降で D1 を作成）

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                 | Purpose                   |
| ----------------------- | ------------------------- |
| `pnpm dev`              | Local development server  |
| `pnpm lint`             | ESLint                    |
| `pnpm typecheck`        | TypeScript check          |
| `pnpm format`           | Prettier write            |
| `pnpm format:check`     | Prettier check            |
| `pnpm test`             | Vitest unit + integration |
| `pnpm test:unit`        | Unit tests only           |
| `pnpm test:integration` | Integration tests only    |
| `pnpm test:e2e`         | Playwright E2E            |
| `pnpm build`            | Production build          |

First E2E run may require:

```bash
pnpm exec playwright install chromium
```

## Documentation

Canonical docs live under `docs/`.

- `docs/01_requirements.md`
- `docs/04_architecture.md`
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

Phase 1（Development Environment）完了。次は Phase 2（Database Foundation）。
