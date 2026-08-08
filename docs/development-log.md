# Development Log

Version: 1.0

---

# 1. Purpose

本ドキュメントは、Task Managerの開発過程における重要な意思決定、技術選定、問題、改善、変更履歴を記録する。

単なる作業履歴ではなく、

- なぜその実装にしたのか
- なぜその技術を選択したのか
- どの問題が発生したのか
- どのように解決したのか
- 今後どのような改善を行うのか

を記録する。

---

# 2. Development Principles

開発では以下を基本方針とする。

- Design First
- Type Safety
- Test First
- Performance First
- Security First
- Maintainability
- Documentation Driven Development

実装だけを先行させず、必要に応じて設計書を更新する。

---

# 3. Project Start

## Date

2026-08-08

## Initial Goal

案件獲得用のポートフォリオとして、実用的なTask Manager Web Applicationを開発する。

単純なTodoアプリではなく、

- Dashboard
- Project Management
- Kanban Board
- Task Detail
- Calendar
- Analytics
- Settings
- Profile

を備えたSaaS風Web Applicationを目指す。

---

# 4. Portfolio Objective

本アプリケーションは単に機能を実装することを目的としない。

以下の能力をポートフォリオとして示す。

### Frontend

- Next.js
- React
- TypeScript
- Responsive Design
- UI / UX
- Animation
- State Management

### Backend

- API Design
- Authentication
- Authorization
- Validation
- Business Logic

### Database

- Relational Database Design
- ORM
- Migration
- Transaction
- Index Design

### Engineering

- Testing
- Git
- CI/CD
- Documentation
- Architecture Design

---

# 5. Technology Selection

## Next.js

採用理由

- Reactベース
- App Router
- Server Components
- Route Handlers
- SSR / SSG
- エコシステムが成熟している

ポートフォリオとして、単純なReact SPAよりもWeb Applicationとしての設計能力を示しやすいため採用する。

---

# 6. React

UI LayerとしてReactを使用する。

Componentベースの設計により、UIの再利用性と保守性を高める。

---

# 7. TypeScript

Type Safetyを重視するためTypeScriptを採用する。

特に以下で型安全性を確保する。

- Component Props
- API Request
- API Response
- Database Model
- Form
- Validation
- Service Layer

---

# 8. Styling

Tailwind CSSを採用する。

理由

- Next.jsとの相性
- Design Tokenとの統合
- Responsive Design
- UI実装速度
- 一貫したSpacing

---

# 9. UI Components

Base UI / shadcn/uiを利用する。

理由

- アクセシビリティ
- 再利用性
- カスタマイズ性
- Reactとの統合
- デザインの一貫性

既存Componentを優先して再利用し、同じ役割のComponentを重複して作成しない。

---

# 10. Icon

Lucide Reactを使用する。

理由

- シンプル
- 一貫したデザイン
- SVGベース
- React対応
- Dashboard UIとの相性

---

# 11. State Management

Server State

```text
TanStack Query
```

Form State

```text
React Hook Form
```

Validation

```text
Zod
```

Local UI State

```text
React useState / useReducer
```

状態の種類ごとに責務を分離する。

---

# 12. Database Decision

DatabaseにはCloudflare D1を採用予定とする。

当初はVercel + Supabase構成も検討した。

しかし、Supabase無料枠のDatabaseが一定時間アクセスされない場合に発生するCold Start / Wake-upによる初回アクセス遅延が、ポートフォリオとして望ましくないと判断した。

そのため、

```text
Cloudflare
+
D1
```

を中心とした構成へ変更した。

---

# 13. Database Decision Reason

ポートフォリオでは、

> 「最初のアクセスで接続できない」

という印象を与えることを避ける必要がある。

そのため、Databaseの無料枠に依存した長時間の復帰処理を避けることを重要視する。

Cloudflare Edgeとの組み合わせにより、ユーザーに近い場所で処理を行いやすい構成を目指す。

---

# 14. ORM Decision

Drizzle ORMを採用予定とする。

理由

- TypeScriptとの親和性
- SQLに近い設計
- Lightweight
- SQLite / D1との相性
- Migration管理
- Type Safety

---

# 15. Authentication Decision

AuthenticationにはAuth.jsを採用予定とする。

認証とAuthorizationを分離する。

Authentication

```text
Who are you?
```

Authorization

```text
What are you allowed to do?
```

### Provider Rollout Order

Phase 3 では次の順で有効化する。

```text
1. GitHub OAuth
2. Google OAuth
3. Email + Password
```

理由:

- GitHubはポートフォリオ / 開発者デモに適し、SMTP不要で最速に導入できる
- Googleは一般ユーザー向けの第2プロバイダとして追加する
- Email + PasswordはLogin画面設計に合わせて最後に追加する（Forgot Password等は必要に応じて後続）

---

# 16. Workspace Architecture

将来的なTeam利用を考慮し、Workspaceを導入する。

```text
User
 ↓
Workspace
 ↓
Project
 ↓
Task
```

これにより、将来的なSaaS化にも対応できる構造を目指す。

---

# 17. Feature First

Feature First Architectureを採用する。

例

```text
features/
├── auth/
├── dashboard/
├── project/
├── task/
├── calendar/
├── analytics/
├── notification/
├── settings/
└── profile/
```

理由

Feature単位でコードをまとめることで、機能追加・削除・保守を容易にする。

---

# 18. UI Design Decision

UIは以下のデザイン思想を参考にする。

- Apple
- Linear
- Vercel
- Stripe
- Raycast
- GitHub Projects
- Notion

方向性

- Dark Theme
- Minimal
- Premium
- Modern
- Spacious
- Elegant

---

# 19. UI Reference

各画面のデザイン検討用として、

```text
ui-reference/
```

を使用する。

UI Referenceは実装コードではなく、デザインの方向性を確認するために使用する。

ReferenceコードをそのままProductionへコピーしない。

---

# 20. Design System

UIの一貫性を保つため、

```text
docs/ui-guideline.md
```

を作成する。

主な対象

- Colors
- Typography
- Spacing
- Radius
- Shadow
- Motion
- Responsive
- Accessibility

---

# 21. Component Design

共通Componentの設計ルールを

```text
docs/07_component_design.md
```

に定義する。

目的

- UIの重複防止
- Component再利用
- Cursorによる実装品質向上
- デザインの一貫性

---

# 22. API Architecture

APIはNext.js Route Handlersを使用する。

基本構造

```text
Client
 ↓
API
 ↓
Service
 ↓
Repository
 ↓
Drizzle
 ↓
D1
```

Route HandlerへBusiness Logicを集中させない。

---

# 23. Service Layer

Business LogicはService Layerへ分離する。

例

```text
project-service.ts
task-service.ts
user-service.ts
analytics-service.ts
```

目的

- Testability
- Reusability
- Maintainability

---

# 24. Repository Layer

Database AccessはRepository Layerへ分離する。

例

```text
project-repository.ts
task-repository.ts
user-repository.ts
```

UIから直接Databaseへアクセスしない。

---

# 25. Validation

外部入力はZodで検証する。

```text
Request
 ↓
Zod
 ↓
Service
 ↓
Repository
```

Client-side Validationだけを信用しない。

Server-sideでも必ずValidationする。

---

# 26. Testing Policy

新しいFeatureを追加する場合、テストを同時に追加する。

最低限

```text
Unit Test
Integration Test
E2E Test
```

を適切に使い分ける。

---

# 27. Test Directory

テストコードはプロジェクト直下の

```text
tests/
```

に配置する。

基本構成

```text
tests/
├── unit/
├── integration/
└── e2e/
```

Feature追加時に必要なテストを追加する。

---

# 28. Initial Load Performance

本プロジェクトでは初回アクセス速度を重要視する。

不要なDatabase接続を初回ページ表示時に発生させない。

特にLogin Pageでは、

```text
Browser
 ↓
Edge / CDN
 ↓
Login UI
```

を基本とする。

Login Page表示だけのためにD1へ接続しない。

---

# 29. Client JavaScript

Client Componentは必要最小限にする。

Server Componentをデフォルトとし、

- Interactive UI
- Drag & Drop
- Dialog
- Dropdown
- Calendar
- Chart
- Animation

など、Client-side処理が必要な部分だけClient Componentとする。

---

# 30. Animation

GSAPを使用予定。

目的は装飾ではなく、

- Interaction Feedback
- Page Transition
- Loading
- Hover
- Modal
- Sidebar

などのUX向上。

`prefers-reduced-motion` を尊重する。

---

# 31. Kanban Architecture

Task BoardではDrag & Dropを実装する。

候補ライブラリ

```text
dnd-kit
```

Task PositionはDatabaseの`position`を利用する。

---

# 32. Task Position Decision

TaskのPositionにはREAL値を使用する。

例えば

```text
1
2
3
```

の間にTaskを追加する場合、

```text
2.5
```

とする。

これにより、Task移動時に大量のPosition Updateが発生することを防ぐ。

---

# 33. Project Progress

Project ProgressはTaskから算出する。

```text
Completed Tasks
÷
Total Tasks
× 100
```

ProgressをDatabaseに重複保存しない。

理由

- データ不整合防止
- Task変更時の更新処理削減
- Single Source of Truth

---

# 34. Analytics

Analytics専用Database Tableは初期実装では作成しない。

以下から算出する。

```text
Tasks
Projects
Activities
Time Entries
```

パフォーマンス問題が発生した場合に集計Tableを検討する。

---

# 35. Caching

Cache可能なデータについてはCacheを利用する。

候補

- Project List
- Analytics
- Public Profile

ただし、User-specific dataを誤って共有Cacheしない。

---

# 36. Security

最低限以下を実装する。

- Authentication
- Authorization
- Input Validation
- Rate Limiting
- CSRF Protection
- XSS Protection
- SQL Injection Protection
- Secure Headers

Clientから送信されたUser IDやWorkspace IDをそのまま信用しない。

---

# 37. Multi-Tenant Security

WorkspaceをTenant Boundaryとして扱う。

```text
Authenticated User
 ↓
Workspace Membership
 ↓
Workspace
 ↓
Project
 ↓
Task
```

Userが所属していないWorkspaceのDataへアクセスできないようにする。

---

# 38. Documentation Driven Development

実装だけを変更して設計書を放置しない。

Architecture変更時

```text
architecture.md
```

Database変更時

```text
database.md
```

API変更時

```text
api.md
```

UI変更時

```text
ui-guideline.md
```

を更新する。

---

# 39. Cursor Development Policy

Cursorに実装を依頼する場合、以下の設計書を参照させる。

```text
AGENTS.md

docs/
├── 01_requirements.md
├── 02_basic_design.md
├── `03_detail-design/*.md`
├── 04_architecture.md
├── 05_database.md
├── 06api.md
├── 07_component_design.md
└── 08_ui-guideline.md
```

Cursorは実装前に関連する設計書を確認する。

---

# 40. Change Log Format

重要な変更は以下の形式で記録する。

```text
## YYYY-MM-DD

### Change

変更内容

### Reason

変更理由

### Alternatives

検討した代替案

### Decision

採用した方式

### Impact

影響範囲

### Follow-up

今後必要な作業
```

---

# 41. Development Log Entries

## 2026-08-08

### Change

Task Managerの基本開発方針を決定。

### Reason

案件獲得用ポートフォリオとして、単純なTodoアプリではなく、実際のSaaSを想定したWeb Applicationを制作するため。

### Decision

以下の画面を実装対象とする。

```text
Login
Dashboard
Project List
Project Detail
Task Board
Task Detail
Calendar
Analytics
Settings
Profile
```

### Impact

Frontend / Backend / Database / Authentication / Testingを含む総合的なWeb Applicationとなる。

---

## 2026-08-08

### Change

Phase 1（Development Environment）を完了した。

### Reason

実装フェーズに入る前に、開発ルール・環境変数戦略・テスト基盤・Git運用を固定するため。

### Decision

- AGENTS.md / Cursor Rules / VS Code settings を開発標準とする
- テストは `tests/{unit,integration,e2e}` + Vitest / Playwright
- 環境変数は `.env.example` + `lib/env/schema.ts` で管理する
- Auth 実装順は GitHub → Google → Email
- Git は Conventional Commits + feature branch（`.cursor/rules/git.mdc`）

### Impact

Phase 2（D1 / Drizzle）以降の実装を、同じ検証コマンドとドキュメント方針で進められる。

### Follow-up

- Phase 2: Cloudflare D1 作成と Drizzle セットアップ
- Phase 3: Auth.js（GitHub から）

---

## 2026-08-08

### Change

Phase 2（Database Foundation）を完了した。

### Reason

Auth / API / UI 実装の前に、D1 と Drizzle のスキーマ・Migration・Seed・テスト基盤を固定するため。

### Decision

- 開発用 D1 名: `task-manager-dev`（database_id: `ecc7cba5-daef-4e4e-b6a2-e2eb031d89eb`）
- Binding 名: `DB`
- Schema は `lib/db/schema/`、Migration は `drizzle/migrations/`
- Auth.js 用 `accounts` / `sessions` / `verification_tokens` は Phase 3 で Adapter 仕様に合わせて追加
- Attachments / Time Entries は将来拡張として Phase 2 では未作成
- 本番用 `task-manager-prod` は Deployment 時に作成
- ローカルテストは better-sqlite3 + 同一 Migration（`foreign_keys=ON`）

### Impact

Repository / Service / Auth 実装を同じ Schema 上で進められる。

### Follow-up

- Phase 3: Auth.js（GitHub → Google → Email）と Auth tables
- Deployment: `task-manager-prod` 作成

---

## 2026-08-08

### Change

Phase 3（Authentication / Authorization）を完了した。

### Reason

保護ルートと Workspace / Project 認可の土台を、API・画面実装前に固定するため。

### Decision

- Auth.js v5 (`next-auth` beta) + `@auth/drizzle-adapter`
- Session strategy: JWT（Credentials 互換）
- Provider 実装順: GitHub → Google → Email（環境変数で個別有効化）
- Auth tables: `accounts` / `sessions` / `verification_tokens` + `users.password_hash`
- Middleware は Edge 安全な `auth.config.ts` を使用
- ローカル Next.js は SQLite（`.data/local.sqlite`）、D1 は migration 済み
- Forgot Password は未実装（後続）

### Impact

`/login` / `/dashboard` / logout / membership helpers が利用可能。

### Follow-up

- Phase 4: Backend / API
- OAuth Client ID を `.env.local` に設定して GitHub / Google を有効化
- Forgot Password フロー

---

## 2026-08-08

### Change

Phase 4（Backend / API）を完了した。

### Reason

UI 実装前に `/api/v1` の契約・認可・Service/Repository 境界を固定するため。

### Decision

- Route Handler → Zod → Service → Repository → Drizzle
- Project / Task の DELETE は Soft Archive（`archived_at`）
- Progress は Task 集計から算出（永続化しない）
- POST `/projects` は `workspaceId` 省略時に所属 Workspace を自動選択
- Settings / Notifications / Comments / Checklist も同レイヤーで実装

### Impact

Phase 5 以降の UI は API 経由でデータ操作できる。

### Follow-up

- Phase 5: Project List / Detail UI
- Calendar / Analytics API は後続 Phase

---

## 2026-08-08

### Change

Vercel + Supabase構成からCloudflare D1を中心とした構成へ方針変更。

### Reason

Supabase無料枠のDatabaseがスリープ状態になった場合、初回Databaseアクセス時に遅延が発生する可能性があるため。

ポートフォリオでは初回アクセス時のUXを重視する。

### Alternatives

- Vercel + Supabase
- Vercel + Neon
- Next.js + Cloudflare D1
- Cloudflare Workers + D1

### Decision

Cloudflare D1を採用予定。

### Impact

Database Architecture / ORM / Deployment Architectureに影響する。

---

## 2026-08-08

### Change

Design Referenceを導入。

### Reason

画面ごとのUI品質とデザインの一貫性を確保するため。

### Decision

Claude等を利用してHTML / CSS / JavaScriptのデザインPrototypeを作成し、

```text
ui-reference/
```

へ保存する。

### Impact

Production UIの実装時にDesign Referenceを参照できる。

---

## 2026-08-08

### Change

Design Tokenを`ui-guideline.md`へ集約。

### Reason

画面ごとのCSSにColor、Spacing、Radiusなどが分散すると、UIの一貫性が失われるため。

### Decision

以下を共通Design Tokenとして管理する。

- Color
- Typography
- Spacing
- Radius
- Shadow
- Motion

### Impact

全画面のUI実装に影響する。

---

## 2026-08-08

### Change

Component Designを導入。

### Reason

同じUI Componentを画面ごとに作り直すことを防止するため。

### Decision

共通ComponentとFeature Componentを分離する。

### Impact

Frontend Architectureに影響する。

---

## 2026-08-08

### Change

WorkspaceをDatabase Architectureへ導入。

### Reason

将来的にTeam / SaaS利用へ拡張できる構造にするため。

### Decision

```text
User
 ↓
Workspace
 ↓
Project
 ↓
Task
```

を基本構造とする。

### Impact

Database / API / Authorizationに影響する。

---

## 2026-08-08

### Change

Project ProgressをTaskから算出する方式を採用。

### Reason

Project ProgressをDatabaseへ保存するとTask Statusとの不整合が発生する可能性があるため。

### Decision

```text
Completed Tasks
÷
Total Tasks
× 100
```

で算出する。

### Impact

Project Dashboard / Analytics / APIに影響する。

---

## 2026-08-08

### Change

Kanban PositionにREAL値を使用する設計を採用。

### Reason

Drag & Drop時に大量のTask Positionを更新する処理を減らすため。

### Decision

Task Positionを小数値として管理する。

### Impact

Task Board / Database / APIに影響する。

---

# 42. Problem / Solution Log

開発中に発生した問題は以下の形式で記録する。

```text
## Problem

問題

## Environment

発生環境

## Cause

原因

## Solution

解決方法

## Prevention

再発防止策
```

---

# 43. Performance Log

Performanceに関する重要な変更は記録する。

対象

- Initial Load
- LCP
- INP
- CLS
- API Response Time
- Database Query Time
- Bundle Size

改善前後の数値が取得できる場合は記録する。

---

# 44. Security Log

Security上重要な変更を記録する。

例

- Authentication変更
- Authorization変更
- Session管理変更
- Rate Limit追加
- Security Header追加
- Input Validation追加

---

# 45. Database Migration Log

Database Schema変更時はMigrationを記録する。

形式

```text
## Migration YYYY-MM-DD

### Change

変更内容

### Reason

変更理由

### Migration

Migration File

### Data Impact

既存データへの影響

### Rollback

Rollback方法
```

---

# 46. API Change Log

API変更時は記録する。

例

```text
## API Change

POST /api/v1/projects

### Change

Request Schema変更

### Reason

理由

### Breaking Change

Yes / No

### Migration

必要な対応
```

---

# 47. UI Change Log

重要なUI変更を記録する。

対象

- Layout
- Design Token
- Component
- Navigation
- Responsive
- Animation

---

# 48. Decision Record

技術的に重要なDecisionは記録する。

以下を必ず記録する。

```text
Context
Decision
Alternatives
Reason
Consequences
```

---

# 49. Architecture Decision Example

## Context

Database選定。

## Alternatives

```text
Supabase
Neon
Cloudflare D1
```

## Decision

Cloudflare D1。

## Reason

Portfolioとして初回アクセス速度と低コスト運用を重視するため。

## Consequences

D1 / SQLiteの制約を考慮したDatabase Designが必要になる。

---

# 50. Future Improvements

今後検討する項目。

```text
Cloudflare R2
Full-text Search
Webhooks
Real-time Updates
AI Task Summary
Recurring Tasks
Task Dependencies
Workspace Invitations
Audit Logs
Time Tracking
PWA
Offline Support
```

優先度と必要性を確認してから実装する。

---

# 51. Development Status

## Current

```text
Requirements       ✓
Basic Design       ✓
Detail Design      ✓
Architecture       ✓
API Design         ✓
Database Design    ✓
UI Guideline       ✓
Component Design   ✓
Development Log    ✓
Phase 1 Env        ✓
Phase 2 Database   ✓
Phase 3 Auth       ✓
Phase 4 API        ✓
```

## Planned

```text
Frontend Implementation (Projects / Tasks UI)
Testing (feature-level E2E)
CI/CD
Deployment (includes task-manager-prod D1)
```

---

# 52. Definition of Done

Featureを完成とする条件。

- Requirementsを満たしている
- UI Guidelineに準拠している
- Component Designに準拠している
- TypeScript Errorがない
- ESLint Errorがない
- Unit Testがある
- Integration Testが必要な場合は実装されている
- E2E Testが必要な場合は実装されている
- Responsive対応されている
- Accessibilityを確認している
- Loading Stateがある
- Error Stateがある
- Empty Stateがある
- Documentationが更新されている

---

# 53. Final Principle

本プロジェクトでは、

> Code is not the only deliverable.

と考える。

以下をすべてProjectの成果物として扱う。

```text
Code
Design
Architecture
Database
API
Tests
Documentation
Performance
Security
```

最終的に、

> 「見た目がすごい」

だけではなく、

> 「設計から実装までちゃんと考えて作られている」

と第三者から評価されるWeb Applicationを目指す。
