# Task Manager (Vantage)

Next.js + Cloudflare Workers / D1 で動く、ポートフォリオ向け Task Manager SaaS です。

Live Demo: [https://task-manager.iq87io25.workers.dev](https://task-manager.iq87io25.workers.dev)

<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/0cb822d1-d613-41ae-a09b-4ba6ee042d2c" />
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/398ca922-d3b8-4966-aba6-3e22c914d779" />
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/f580f242-301e-4288-a8e5-29daf35ebd2f" />
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/b74c800b-319c-4471-8cf4-d59dfe794253" />
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/3e3a5a25-c9df-4e18-956b-d3d3a10d5744" />
<img width="390" height="844" alt="image" src="https://github.com/user-attachments/assets/0113a6a5-476a-461a-b362-3a0e97312557" />
<img width="390" height="844" alt="image" src="https://github.com/user-attachments/assets/f594d712-a3f1-44ef-94f1-dcbf04a7ba04" />
<img width="390" height="844" alt="image" src="https://github.com/user-attachments/assets/a5684717-b60f-4fe2-9df4-d141c0823b8a" />
<img width="390" height="844" alt="image" src="https://github.com/user-attachments/assets/408fa2be-0a0c-4f45-b67e-cab84ba1b079" />
<img width="390" height="844" alt="image" src="https://github.com/user-attachments/assets/92470349-a1ad-43c9-a87e-13193184188f" />

## Demo login

| Field    | Value             |
| -------- | ----------------- |
| Email    | `demo@example.com` |
| Password | `DemoPass123!`    |

ログイン画面にも同じ案内があります。

## Product Overview

個人開発者・フリーランス・小規模チーム向けに、Project / Task / Calendar / Analytics / Activity を一つの UI にまとめたプロジェクト管理アプリです。

## Features

- Email + Password 認証（Auth.js）、任意で GitHub / Google OAuth
- Dashboard（今日のタスク・進捗・アクティビティ）
- Projects / Kanban Board / Task Detail（コメント・チェックリスト）
- Calendar / Analytics
- Notifications / Settings / Profile
- Workspace・Project 単位の認可

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS / shadcn/ui
- Auth.js (next-auth v5)
- Drizzle ORM + Cloudflare D1（ローカルは SQLite）
- OpenNext → Cloudflare Workers
- Zod / Vitest / Playwright

## Architecture

```text
UI → API / Server Action → Validation → Service → Repository → Drizzle → D1/SQLite
```

詳細は `docs/04_architecture.md` を参照。

Workers 上のログイン / ログアウトは `next-auth/react` 経由（Server Action 内の Auth.js redirect は使いません）。

## Database

| Item       | Value                 |
| ---------- | --------------------- |
| Dev D1     | `task-manager-dev`    |
| Prod D1    | `task-manager-prod`   |
| Binding    | `DB`                  |
| Schema     | `lib/db/schema/`      |
| Migrations | `drizzle/migrations/` |

Seed 戦略:

- **E2E:** `pnpm db:seed:e2e` → 最小データ（`seedDemoData`）
- **Local / Demo:** `pnpm db:seed:local` → リッチなポートフォリオデータ（`seedPortfolioData`）
- **Production Live Demo:** `CONFIRM_PROD_SEED=yes pnpm db:seed:prod`

## Local setup

```bash
pnpm install
cp .env.example .env.local
# AUTH_SECRET を設定（openssl rand -base64 32）
# AUTH_EMAIL_ENABLED=true
pnpm db:migrate:local   # または SQLite migrate via seed
pnpm db:seed:local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                 | Purpose                         |
| ----------------------- | ------------------------------- |
| `pnpm dev`              | Local development               |
| `pnpm lint`             | ESLint                          |
| `pnpm typecheck`        | TypeScript                      |
| `pnpm test`             | Vitest unit + integration       |
| `pnpm test:e2e`         | Playwright E2E                  |
| `pnpm db:migrate:local` | Apply migrations to local D1    |
| `pnpm db:migrate:prod`  | Apply migrations to prod D1     |
| `pnpm db:seed:local`    | Portfolio seed (SQLite)         |
| `pnpm db:seed:e2e`      | Minimal E2E seed                |
| `pnpm db:seed:prod`     | Portfolio seed (prod D1, gated) |
| `pnpm deploy`           | OpenNext build + Workers deploy |

## Testing

```bash
pnpm test:unit
pnpm test:integration
pnpm exec playwright install chromium   # first E2E run
pnpm test:e2e
```

## Deployment

- Hosting: Cloudflare Workers (`task-manager`) via OpenNext
- CD: `.github/workflows/deploy.yml`（`master`/`main` で CI 成功後に Deploy）
- Secrets: `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`（Wrangler + GitHub Environment）

本番デモデータを入れ直す場合:

```bash
# 1. migrations（未適用の場合）
pnpm db:migrate:prod

# 2. portfolio seed（明示フラグ必須）
# bash / Git Bash:
CONFIRM_PROD_SEED=yes pnpm db:seed:prod

# PowerShell:
$env:CONFIRM_PROD_SEED="yes"; pnpm db:seed:prod
```

`scripts/seed-prod.ts` は Cloudflare D1 HTTP API（`wrangler login` の OAuth または `CLOUDFLARE_API_TOKEN`）で本番 D1 に書き込みます。

## Documentation

Canonical docs:

- `docs/product.md`
- `docs/01_requirements.md`
- `docs/04_architecture.md`
- `docs/05_database.md`
- `docs/06_api.md`
- `docs/roadmap.md`
- `docs/development-log.md`

Agent rules: `AGENTS.md`, `.cursor/rules/`

## Design decisions

- Server Components 既定、Client は必要最小
- 認証・認可はサーバ側で強制
- Feature-first のディレクトリ構成
- ログインページは DB なしで描画（高速な初回表示）

## License

Private portfolio project.
