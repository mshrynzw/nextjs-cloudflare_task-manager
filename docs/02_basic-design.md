# 基本設計書

---

# 1. 目的

本書は「Task Manager」のシステム構成、画面構成、アーキテクチャおよび設計方針を定義する。

本設計書をもとに詳細設計書および実装を行う。

---

# 2. システム構成

```
┌─────────────────────┐
│      Browser        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Next.js App Router  │
│ (React Server Comp.)│
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
 Route Handler  Server Actions
     │
     ▼
┌─────────────────────┐
│     Drizzle ORM     │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   Cloudflare D1     │
└─────────────────────┘
```

---

# 3. 技術構成

## フロントエンド

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

## バックエンド

- Next.js Route Handlers
- Server Actions

## データベース

- Cloudflare D1
- Drizzle ORM

## 認証

- Auth.js

## バリデーション

- Zod
- React Hook Form

## 状態管理

- TanStack Query
- React Context（必要最小限）

---

# 4. アーキテクチャ

Feature First Architecture を採用する。

```
app
│
├── (auth)
├── (dashboard)
├── api
│
features
│
├── auth
├── dashboard
├── project
├── task
├── calendar
├── analytics
├── settings
└── profile
```

共通UIは `components` に配置し、業務ロジックは各 `features` 配下に配置する。

---

# 5. ディレクトリ構成

```
app/

components/

features/

hooks/

lib/

services/

types/

styles/

docs/

public/

tests/
```

各ディレクトリの役割は以下のとおり。

| ディレクトリ | 役割                     |
| ------------ | ------------------------ |
| app          | 画面・ルーティング       |
| components   | 共通UIコンポーネント     |
| features     | 機能単位の実装           |
| hooks        | カスタムフック           |
| lib          | ユーティリティ・設定     |
| services     | 外部サービスとのやり取り |
| types        | 型定義                   |
| styles       | グローバルスタイル       |
| tests        | テストコード             |

---

# 6. 認証設計

認証方式は Auth.js を採用する。

対応予定

- メールログイン
- Googleログイン
- GitHubログイン

未認証ユーザーはログイン画面へリダイレクトする。

ログイン後は Dashboard を表示する。

---

# 7. 画面遷移

```
Login
   │
   ▼
Dashboard
   │
   ├─────────────┐
   ▼             ▼
Project List   Calendar
   │             │
   ▼             │
Project Detail   │
   │             │
   ▼             ▼
Task Board   Analytics
   │
   ▼
Task Detail

Settings
Profile
```

---

# 8. 画面レイアウト

基本レイアウトは全画面共通とする。

```
+-----------------------------------------+
| Header                                  |
+-----------+-----------------------------+
| Sidebar   |                             |
|           |        Main Content         |
|           |                             |
|           |                             |
+-----------+-----------------------------+
```

モバイルでは Sidebar を Drawer に変更する。

---

# 9. UI設計方針

デザインコンセプト

- Linear
- Vercel
- Raycast
- Notion
- Apple

デザインルール

- ダークテーマ
- シンプル
- 高級感
- 十分な余白
- カードベースUI
- アイコンは Lucide
- 角丸 16px を基準
- ガラス表現は控えめ
- アニメーションは自然で高速

---

# 10. コンポーネント設計

共通コンポーネントを優先して利用する。

主なコンポーネント

- Button
- Input
- Textarea
- Select
- Checkbox
- Switch
- Badge
- Avatar
- Card
- Dialog
- Dropdown Menu
- Tooltip
- Popover
- Toast
- Skeleton
- Command Palette
- Empty State

画面固有のUIは各 Feature 配下で管理する。

---

# 11. データ取得方針

- Server Components を優先する。
- クライアント側で更新が必要なデータは TanStack Query を利用する。
- フォーム送信は Server Actions を優先して利用する。

---

# 12. エラーハンドリング

以下を実装対象とする。

- 404ページ
- 500エラーページ
- フォーム入力エラー
- APIエラー
- 認証エラー
- ネットワークエラー

エラー通知には Toast を利用する。

---

# 13. レスポンシブ対応

対象デバイス

| デバイス | 対応 |
| -------- | ---- |
| Desktop  | ○    |
| Tablet   | ○    |
| Mobile   | ○    |

モバイルでは

- Sidebar → Drawer
- Grid → 1カラム
- Dialog → Bottom Sheet（必要に応じて）

へ切り替える。

---

# 14. 非機能設計

## パフォーマンス

- Server Components を活用
- 必要最小限の Client Components
- 画像の最適化
- 適切なキャッシュ

## 保守性

- TypeScript Strict Mode
- Feature First Architecture
- コンポーネント再利用
- ESLint
- Prettier

## アクセシビリティ

- キーボード操作対応
- 適切なARIA属性
- コントラスト比を考慮

---

# 15. 今後の設計

本設計書をもとに、以下を作成する。

- 03_detail_design.md
- 04_database.md
- 05_api.md
- 06_screen_design.md
- 07_component_design.md
- 08_ui_guideline.md
- 09_testing.md
- 10_deployment.md

詳細な画面仕様、データベース設計、API仕様、コンポーネント設計は各設計書で定義する。
