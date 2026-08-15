# Architecture Design

Version: 1.0

---

# 1. Overview

本ドキュメントは、Task Managerのシステムアーキテクチャを定義する。

本アプリケーションは、ポートフォリオとして高いUI/UX品質と実用的なWebアプリケーション設計の両立を目指す。

主な要件は以下とする。

- 高速な初回アクセス
- Cloudflareを活用した低レイテンシーな構成
- 無料または低コストで運用可能な構成
- サーバーレスアーキテクチャ
- 型安全な開発
- テスト可能な設計
- 保守性・拡張性の高いコード
- UIとデータアクセスの責務分離

---

# 2. Architecture Goals

以下をアーキテクチャ上の重要な目標とする。

## 2.1 Performance

初回アクセス時に「接続できない」「非常に遅い」と感じさせないことを最優先する。

特定のデータベースサービスのスリープ復帰に依存する構成を避ける。

---

## 2.2 Cost

個人ポートフォリオとして運用できるよう、可能な限り無料枠を利用する。

ただし、無料枠の制約によってUXやアーキテクチャが大きく悪化する場合は、有料サービスの利用も検討する。

---

## 2.3 Scalability

将来的に以下の機能を追加できる構造とする。

- Team
- Workspace
- Role / Permission
- File Upload
- Notification
- Integration
- AI Feature
- Time Tracking

---

## 2.4 Maintainability

UI、ビジネスロジック、データアクセスを分離する。

特定の画面にビジネスロジックやデータベース処理を集中させない。

---

# 3. High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge                         │
│                                                             │
│  CDN / Cache / Security / Routing                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       Next.js App                            │
│                                                             │
│  App Router                                                 │
│  Server Components                                          │
│  Client Components                                          │
│  Route Handlers                                             │
│  Server Actions                                             │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        Service Layer              Authentication
                │                         │
                ▼                         ▼
        Repository Layer             Auth.js
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                       Cloudflare D1                         │
│                         SQLite                              │
└─────────────────────────────────────────────────────────────┘
```

---

# 4. Technology Stack

## Frontend

| Technology          | Purpose                  |
| ------------------- | ------------------------ |
| Next.js             | Application Framework    |
| React               | UI                       |
| TypeScript          | Type Safety              |
| Tailwind CSS        | Styling                  |
| Base UI / shadcn/ui | UI Components            |
| Lucide React        | Icons                    |
| TanStack Query      | Client-side server state |
| React Hook Form     | Form Management          |
| Zod                 | Validation               |
| GSAP                | Animation                |

---

## Backend

| Technology                | Purpose                   |
| ------------------------- | ------------------------- |
| Next.js Route Handlers    | API                       |
| Next.js Server Components | Server-side data fetching |
| Server Actions            | Server-side mutations     |
| Auth.js                   | Authentication            |
| Zod                       | Request Validation        |

---

## Database

| Technology    | Purpose         |
| ------------- | --------------- |
| Cloudflare D1 | Database        |
| SQLite        | Database Engine |
| Drizzle ORM   | Database Access |

---

## Infrastructure

| Technology           | Purpose                |
| -------------------- | ---------------------- |
| Cloudflare           | Edge / CDN / Security  |
| Vercel or Cloudflare | Application Hosting    |
| GitHub               | Source Code Management |

---

# 5. Hosting Strategy

本プロジェクトではCloudflareを中心とした構成を採用する。

ただし、Next.jsの実行環境については、開発時点のCloudflare / Next.jsの互換性を確認した上で最終決定する。

候補

```text
Option A

Cloudflare
├── Pages / Workers
├── D1
└── CDN


Option B

Vercel
├── Next.js
└── Cloudflare
    ├── D1
    └── CDN / Security
```

最終的なHosting Providerは、実装時のNext.jsおよびCloudflare対応状況を確認して決定する。

---

# 6. Frontend Architecture

Next.js App Routerを採用する。

```text
app/
├── (auth)/
│   └── login/
│
├── dashboard/
│
├── projects/
│   ├── page.tsx
│   └── [projectId]/
│
├── calendar/
│
├── analytics/
│
├── settings/
│
├── profile/
│
└── api/
    └── v1/
```

---

# 7. Server Components

Server Componentsをデフォルトとする。

以下のような処理はServer Componentを優先する。

- 初期データ取得
- SEOが必要なコンテンツ
- サーバー側で完結する処理
- データベースアクセス

Client Componentは必要な場合のみ使用する。

---

# 8. Client Components

以下のようなUIはClient Componentとする。

- Drag & Drop
- Modal
- Dropdown
- Command Palette
- Form
- Calendar Interaction
- Chart
- Animation
- Real-time UI

Client Componentをページ全体へ適用することは禁止する。

---

# 9. State Management

状態を以下の4種類に分類する。

## Server State

TanStack Query

例

- Projects
- Tasks
- Notifications
- Analytics

---

## Local UI State

React useState / useReducer

例

- Modal Open
- Sidebar Open
- Dropdown Open
- Selected Tab

---

## Form State

React Hook Form

---

## URL State

URL Search Parameters

例

```text
/projects?status=active&sort=updatedAt
```

---

## Locale

UI 言語は Cookie `vantage_locale`（`ja` | `en`）で解決する。未設定時は日本語。

ログイン後に Appearance で変更すると Cookie と `users.language` を同期する。

日本語 UI は M PLUS 2、英語 UI は Geist を `html[lang]` で切り替える。

---

# 10. Data Flow

基本的なデータフロー

```text
UI
 ↓
Hook
 ↓
API / Server Action
 ↓
Service
 ↓
Repository
 ↓
Drizzle
 ↓
D1
```

UIから直接D1へアクセスしてはいけない。

---

# 11. API Layer

APIはNext.js Route Handlersで実装する。

```text
app/api/v1/
```

APIの詳細仕様は

```text
docs/api.md
```

を参照する。

---

# 12. Service Layer

Service Layerはビジネスロジックを担当する。

例

```text
lib/services/
├── project-service.ts
├── task-service.ts
├── user-service.ts
├── calendar-service.ts
└── analytics-service.ts
```

Service Layerでは以下を行う。

- Business Logic
- Permission Check
- Transaction
- Repository呼び出し

---

# 13. Repository Layer

Repository Layerはデータベースアクセスを担当する。

```text
lib/repositories/
├── project-repository.ts
├── task-repository.ts
├── user-repository.ts
├── comment-repository.ts
└── activity-repository.ts
```

Repository Layer以外から直接DB操作を行わない。

---

# 14. Database Architecture

DatabaseにはCloudflare D1を使用する。

```text
Application
     │
     ▼
Drizzle ORM
     │
     ▼
Cloudflare D1
     │
     ▼
SQLite
```

Database設計は

```text
docs/database.md
```

を参照する。

---

# 15. Authentication Architecture

認証にはAuth.jsを採用する。

```text
Browser
   │
   ▼
Auth.js
   │
   ▼
Session
   │
   ▼
User
```

認証情報をClient Componentに直接保存しない。

## 15.1 Login / Sign-in flow（Cloudflare Workers）

Credentials / OAuth の `signIn` と `signOut` はクライアントの `next-auth/react` 経由のみで行う。

ログイン経路では Server Action を使わない。`/login` ページの Server Action は、既存セッション時の `redirect("/dashboard")` と組み合わさると 302 になり、クライアントが例外扱いするため。

ログアウトも同様に、Server Action 内の Auth.js `signOut` は Workers 上で session cookie の削除が効かないことがあるため使わない。

```text
Login Form (Client)
   │
   ├─ (任意) POST /api/v1/auth/register … ユーザー作成のみ
   │
   └─ next-auth/react signIn → /api/auth/callback/*
         │
         ▼
      Session cookie
         │
         ▼
      window.location → /dashboard
```

```text
Sign out (Client)
   │
   └─ next-auth/react signOut → /api/auth/signout
         │
         ▼
      Session cookie cleared
         │
         ▼
      /login
```

Auth.js は OpenNext 上で `getCloudflareContext({ async: true })` 経由の D1（`getDbAsync`）を使う。

認可は引き続き Server Component / Route Handler 上の `auth()` で行う。

---

# 16. Authorization

AuthenticationとAuthorizationを分離する。

```text
Authentication

Who are you?
```

```text
Authorization

What are you allowed to do?
```

Projectの閲覧は、公開範囲（`visibility`）と Membership の組み合わせで確認する。

```text
User
 │
 ▼
Workspace Membership
 │
 ▼
Project Membership または visibility = workspace
 │
 ▼
Role（変更操作のみ Project Membership）
 │
 ▼
Permission
```

- `visibility = workspace`（既定）: ワークスペースメンバーはプロジェクト情報・タスクを閲覧できる
- `visibility = members`: プロジェクトメンバーのみ閲覧できる
- 作成・更新・削除・コメント投稿などの変更は、公開範囲に関係なくプロジェクトメンバーのロールに従う

---

# 17. Role

基本Role

```text
owner
member
viewer
```

詳細な権限は

```text
docs/api.md
```

およびDatabase設計に従う。

---

# 18. Feature First Architecture

Feature Firstを採用する。

画面単位ではなく、機能単位でコードを整理する。

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

---

# 19. Feature Structure

Featureは原則として以下の構造を採用する。

```text
features/task/
├── components/
├── hooks/
├── schemas/
├── types/
├── services/
└── utils/
```

ただし、すべてのFeatureで無理に全ディレクトリを作成する必要はない。

必要なものだけ作成する。

---

# 20. Shared Components

共通UIは

```text
components/
```

に配置する。

例

```text
components/
├── ui/
├── layout/
├── navigation/
└── feedback/
```

Feature固有のコンポーネントはFeature内に配置する。

---

# 21. Component Boundary

以下の判断基準を使用する。

## Shared Component

複数Featureで利用される。

例

```text
Button
Dialog
Card
Input
Badge
```

---

## Feature Component

特定Featureに依存する。

例

```text
TaskCard
ProjectCard
CalendarEvent
```

---

## Page Component

特定ページのレイアウトを組み立てる。

ページ固有のUIロジックをShared Componentへ持ち込まない。

---

# 22. UI Architecture

UIデザインは

```text
docs/ui-guideline.md
```

に定義されたDesign Tokenを使用する。

以下を画面ごとに独自定義してはいけない。

- Color
- Radius
- Shadow
- Spacing
- Typography

---

# 23. Design Reference

UIのリファレンスは

```text
ui-reference/
```

に保存する。

画面実装時には該当画面のReferenceを確認する。

ただし、ReferenceのHTML/CSS/JavaScriptをそのまま本番コードへコピーしてはいけない。

Referenceはデザイン仕様として利用する。

---

# 24. Responsive Architecture

Responsive Designを必須とする。

```text
Desktop
    ↓
Tablet
    ↓
Mobile
```

BreakpointはUI Guidelineに従う。

---

# 25. Animation Architecture

GSAPを使用する。

アニメーションはUI体験を補助する目的で使用する。

以下は禁止する。

- 過度なアニメーション
- 操作を妨げるアニメーション
- 長時間のページロードアニメーション
- 意味のない装飾アニメーション

`prefers-reduced-motion` を尊重する。

---

# 26. Performance Architecture

Performanceを重要な設計要件とする。

優先事項

1. Fast Initial Load
2. Server-side Rendering
3. Static Rendering
4. Edge Caching
5. Minimal Client JavaScript
6. Lazy Loading

---

# 27. Initial Load Strategy

ログインしていないユーザーがアクセスした場合でも、不要な外部サービスへの接続を発生させない。

特に、ログイン画面の表示だけのためにDatabaseへアクセスしてはいけない。

```text
Browser
 ↓
Login Page
 ↓
Auth.js JWT session read（adapter なし / DB なし）
 ↓
Login UI
```

実装上は `app/login/page.tsx` が `NextAuth(authConfig)` のみを使い、
`auth.ts` の Drizzle adapter は Proxy で初回利用時まで `getDb()` を遅延する。

```text
Browser
 ↓
CDN / Edge
 ↓
Login Page
```

を基本とする。

---

# 28. Authenticated Data Loading

認証後に必要なデータのみ取得する。

```text
Login
 ↓
Session
 ↓
Dashboard
 ↓
Required Data
```

Dashboardに不要なデータを初回ロード時に取得してはいけない。

---

# 29. Database Connection Strategy

Databaseへのアクセスは必要な処理に限定する。

Client Componentから直接Databaseへアクセスしない。

Databaseアクセスは以下に限定する。

```text
Server Component
Route Handler
Server Action
Repository
```

---

# 30. Caching Strategy

キャッシュ可能なデータには適切なCache Strategyを適用する。

例

```text
Project List
Analytics
Public Profile
```

ただし、ユーザー固有データや権限情報を共有キャッシュしてはいけない。

---

# 31. Error Handling Architecture

エラーは以下のレイヤーで処理する。

```text
UI
 ↓
API
 ↓
Service
 ↓
Repository
 ↓
Database
```

各レイヤーで適切なErrorを生成する。

ユーザーには内部実装情報を公開しない。

---

# 32. Error Boundary

Next.jsのError Boundaryを使用する。

ページ全体をクラッシュさせず、可能な限りFeature単位でエラーを隔離する。

---

# 33. Loading Architecture

Next.jsのLoading UIを利用する。

```text
loading.tsx
```

さらにClient-side Data FetchingではSkeletonを使用する。

---

# 34. Empty State

データが存在しない場合はEmpty Stateを表示する。

例

```text
No projects yet.
```

ユーザーが次に何をすればよいか分かるCTAを提供する。

---

# 35. Testing Architecture

テストコードはプロジェクト直下に配置する。

```text
tests/
├── unit/
├── integration/
└── e2e/
```

---

# 36. Unit Test

対象

- Utility
- Validation
- Service
- Repository
- Business Logic

---

# 37. Integration Test

対象

- API
- Database
- Authentication
- Feature

---

# 38. E2E Test

主要ユーザーフローをテストする。

最低限

```text
Login
 ↓
Dashboard
 ↓
Create Project
 ↓
Create Task
 ↓
Move Task
 ↓
Task Detail
 ↓
Logout
```

---

# 39. Test Rule

新しいFeatureを追加する場合、テストも同時に追加する。

テストなしでFeatureを完成扱いにしてはいけない。

---

# 40. Security Architecture

以下を基本的なセキュリティ要件とする。

- Authentication
- Authorization
- Input Validation
- Rate Limiting
- CSRF Protection
- XSS Protection
- SQL Injection Protection
- Secure Headers

---

# 41. Secrets

秘密情報をGitへCommitしてはいけない。

対象

```text
API Key
Secret
Password
Session Secret
Database Credential
OAuth Secret
```

`.env.local` はGit管理対象外とする。

---

# 42. Environment

環境を分離する。

```text
Development
Staging
Production
```

環境ごとにDatabaseやAuthentication設定を分離する。

---

# 43. Environment Variables

環境変数の定義方針は以下とする。

## 43.1 Source of Truth

- ローカル開発: `.env.local`（Git管理対象外）
- テンプレート: `.env.example`（プレースホルダのみをCommit）
- Schema: `lib/env/schema.ts`（Zodによる検証）

`.env.example` をコピーして `.env.local` を作成する。

```bash
cp .env.example .env.local
```

## 43.2 Variable Categories

```text
NEXT_PUBLIC_*     Clientに公開してよい値のみ
AUTH_*            Auth.js / OAuth / Session（Server only）
Cloudflare / D1   Phase 2 以降で wrangler binding と合わせて定義
```

秘密情報には `NEXT_PUBLIC_` プレフィックスを付けない。

## 43.3 Auth Provider Rollout

Phase 3 の認証実装順は次とする。

```text
1. GitHub OAuth
2. Google OAuth
3. Email + Password
```

本番・ローカルともに **少なくとも1つの認証方式** が有効であること。
GitHub は必須ではない（Email-only / Google-only も可）。

GitHubを最初に有効化し、Google / Emailは後続で追加する。

必要な主な変数:

```text
NEXT_PUBLIC_APP_URL
AUTH_SECRET
AUTH_URL
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
AUTH_EMAIL_ENABLED
```

実際の環境変数はプロジェクトのDeployment環境に合わせて定義する。

## 43.4 Cloudflare D1

開発用 Database:

```text
name: task-manager-dev
binding: DB
config: wrangler.jsonc
```

本番用 Database:

```text
name: task-manager-prod
binding: DB
config: wrangler.jsonc → env.production
```

ローカル検証では better-sqlite3（同一 Migration）も利用できる。
`getDb()` / `getDbAsync()` は次の優先順位とする。

```text
1. SQLITE_DB_PATH が明示されている → その SQLite ファイル（E2E / 明示ローカル）
2. Cloudflare コンテキストの D1 binding
3. 既定のローカル SQLite（.data/local.sqlite）
```

`SQLITE_DB_PATH` 優先は、`initOpenNextCloudflareForDev` が空のローカル D1 を露出しても、seed 済み E2E DB を誤って上書き参照しないため。

## 43.5 Validation

外部入力と同様に、環境変数も Schema で検証する。

Auth.js を有効化するタイミングで `parseAuthEnv()` を Server 側からのみ呼び出す。

---

# 44. Observability

将来的に以下を導入する。

- Error Tracking
- Application Logging
- Performance Monitoring
- Analytics

Production Errorを追跡可能にする。

---

# 45. Deployment Architecture

基本フロー

```text
Developer
    │
    ▼
GitHub
    │
    ▼
CI (quality + e2e)
    │
    ▼
Deploy (CI success on master/main, or workflow_dispatch / local `pnpm deploy`)
    │
    ▼
OpenNext build
    │
    ▼
Cloudflare Workers
    │
    ├── Assets (ASSETS)
    ├── D1 (task-manager-prod)
    └── Secrets (AUTH_*)
```

## 45.1 Runtime

| 環境 | App runtime | Database |
| --- | --- | --- |
| `pnpm dev` | Next.js (Node) | SQLite (`.data/local.sqlite`) |
| `pnpm preview:cf` | Workers (workerd) | D1 local / bound |
| Production | Cloudflare Workers | D1 `task-manager-prod` |

Hosting: `@opennextjs/cloudflare` → Worker `task-manager`  
Default URL: `https://task-manager.<account>.workers.dev`（カスタムドメインは任意）

## 45.2 Secrets

Production secrets are set with Wrangler（never committed）:

```text
AUTH_SECRET
AUTH_URL
NEXT_PUBLIC_APP_URL
```

Optional OAuth secrets: `AUTH_GITHUB_*` / `AUTH_GOOGLE_*`  
`AUTH_EMAIL_ENABLED` is a plain `vars` value in `wrangler.jsonc` production env.

---

# 46. CI/CD

GitHub Actions を利用する。

Workflow: `.github/workflows/ci.yml`

Pull Request / `main`・`master` への Push 時:

```text
Lint
 ↓
Type Check
 ↓
Unit Test
 ↓
Integration Test
 ↓
Build
 ↓
E2E (Playwright)
```

すべて成功した場合のみマージ可能とすることを目標とする。

本番デプロイは `.github/workflows/deploy.yml` で行う。

- `master` / `main` への Push 後、**CI 成功時に自動 Deploy**
- 手動実行: Actions → Deploy → `workflow_dispatch`
- ローカル: `pnpm deploy`

GitHub Environment `production` に以下を設定する:

- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `AUTH_SECRET`
- Vars: `APP_URL`（例: `https://task-manager.<subdomain>.workers.dev`）

---

# 47. Git Strategy

基本Branch

```text
master
```

Feature開発では

```text
feature/*
```

を使用する。

例

```text
feature/login
feature/project-list
feature/task-board
```

---

# 48. Commit Convention

Commit Messageは意味が明確になるようにする。

例

```text
feat: add project list
fix: fix task status update
refactor: extract task service
test: add project repository tests
docs: update api design
style: improve dashboard layout
```

---

# 49. Dependency Policy

依存パッケージを追加する前に、既存パッケージで代替できないか確認する。

新しいライブラリを導入する場合は以下を確認する。

- Bundle Size
- Maintenance Status
- License
- Security
- Next.js Compatibility
- Cloudflare Compatibility

---

# 50. Current Technology Status

現在のリポジトリで導入済みの主な技術は以下。

```text
Next.js
React
TypeScript
Tailwind CSS
Base UI
shadcn
TanStack Query
React Hook Form
Zod
Lucide React
date-fns
dnd-kit
```

これらは現在の `package.json` に定義されている。

---

# 51. Planned Technology

以下は設計上の採用予定であり、未導入の場合は実装済みとして扱わない。

```text
Cloudflare D1
Drizzle ORM
Auth.js
Cloudflare Workers / Pages
GSAP
```

導入時にはpackage.json、設計書、READMEを更新する。

---

# 52. Architecture Decision Rules

技術選定や実装方法に迷った場合は以下の優先順位で判断する。

```text
1. Security
2. Correctness
3. Performance
4. Maintainability
5. Developer Experience
6. Visual Quality
7. Implementation Speed
```

---

# 53. Forbidden Architecture

以下は禁止する。

- Client Componentから直接Databaseへ接続
- UI Componentへの大量のBusiness Logic
- Route Handlerへの大量のBusiness Logic
- Feature間の不要な依存
- Shared ComponentへのFeature固有ロジックの混入
- API仕様を無視した独自レスポンス
- Zodを使わない外部入力処理
- テストなしでの主要Feature実装
- 画面ごとの独自Design Token
- 秘密情報のGit Commit

---

# 54. Architecture Documentation

アーキテクチャに変更を加えた場合は、本ドキュメントも更新する。

関連ドキュメント

```text
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

---

# 55. Cursor Implementation Rules

CursorはFeature実装前に以下を確認すること。

```text
01_requirements.md
02_basic_design.md
03_detail_design/
architecture.md
database.md
api.md
ui-guideline.md
07_component_design.md
```

実装時は以下の優先順位で既存仕様を尊重する。

```text
Requirements
    ↓
Architecture
    ↓
Database / API
    ↓
UI Guideline
    ↓
Component Design
    ↓
Implementation
```

仕様に矛盾がある場合、勝手に実装を進めず、矛盾点を報告する。

---

# 56. Architecture Change Rule

以下を変更する場合は、Architecture Documentationを更新する。

- Framework
- Database
- Authentication
- Hosting
- API Architecture
- Folder Structure
- State Management
- Testing Strategy
- Deployment Strategy

コードだけ変更して設計書を放置してはいけない。

---

# 57. Target Architecture

最終的な目標構成

```text
                         ┌───────────────┐
                         │    Browser    │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │ Cloudflare Edge/CDN  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Next.js         │
                    │                      │
                    │ App Router           │
                    │ Server Components    │
                    │ Client Components    │
                    │ Route Handlers       │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         Auth.js         Service Layer    TanStack Query
                              │
                              ▼
                       Repository Layer
                              │
                              ▼
                         Drizzle ORM
                              │
                              ▼
                       Cloudflare D1
                              │
                              ▼
                           SQLite
```

---

# 58. Final Principles

本プロジェクトでは以下を最重要原則とする。

> Keep the UI beautiful.

> Keep the architecture simple.

> Keep the database close to the edge.

> Keep the client lightweight.

> Keep business logic out of the UI.

> Keep the system testable.

> Keep the documentation synchronized with the code.

ポートフォリオとしての視覚的な完成度だけでなく、実際の案件開発でも通用する設計・実装品質を目指す。
