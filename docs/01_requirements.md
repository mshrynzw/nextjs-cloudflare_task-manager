# 要件定義書

---

# 1. プロジェクト概要

## プロジェクト名

Task Manager

## 概要

Task Manager は、案件獲得用ポートフォリオとして制作するタスク管理Webアプリケーションである。

本アプリケーションは、海外SaaSのような洗練されたUI/UXと、実務レベルの設計・実装スキルを示すことを目的として制作する。

デザインだけでなく、アーキテクチャ、コンポーネント設計、データベース設計、コード品質、保守性まで考慮した実践的なアプリケーションを目指す。

---

# 2. 開発目的

## 主目的

- フリーランス案件獲得用ポートフォリオ
- Web制作会社への転職活動
- モダンな技術スタックの習得
- 実務レベルの設計能力のアピール

## 開発コンセプト

「実際に販売されていても違和感がないタスク管理SaaS」

---

# 3. 対象ユーザー

- 個人開発者
- フリーランス
- 小規模チーム
- Web制作会社
- ソフトウェアエンジニア

---

# 4. システム概要

本システムでは以下の機能を提供する。

- ログイン
- ダッシュボード
- プロジェクト管理
- タスク管理
- カンバン管理
- カレンダー表示
- 分析画面
- プロフィール管理
- 設定管理

---

# 5. 開発環境

## フロントエンド

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

## バックエンド

- Next.js Route Handlers

## データベース

- Cloudflare D1
- Drizzle ORM

## 認証

- Auth.js

## バリデーション

- Zod
- React Hook Form

## データ取得

- TanStack Query

## デプロイ

- Cloudflare

---

# 6. 機能一覧

| 機能           | 概要                       |
| -------------- | -------------------------- |
| ログイン       | メール・Google・GitHub認証 |
| Dashboard      | 全体状況を表示             |
| Project List   | プロジェクト一覧           |
| Project Detail | プロジェクト詳細           |
| Task Board     | Kanban管理                 |
| Task Detail    | タスク詳細                 |
| Calendar       | 予定表示                   |
| Analytics      | 分析画面                   |
| Settings       | 各種設定                   |
| Profile        | プロフィール               |

---

# 7. 画面一覧

| No  | 画面名         |
| --- | -------------- |
| 01  | Login          |
| 02  | Dashboard      |
| 03  | Project List   |
| 04  | Project Detail |
| 05  | Task Board     |
| 06  | Task Detail    |
| 07  | Calendar       |
| 08  | Analytics      |
| 09  | Settings       |
| 10  | Profile        |

---

# 8. 各画面の要件

## Login

### 機能

- メールログイン
- Googleログイン
- GitHubログイン
- Remember Me
- パスワード入力
- ローディング演出

---

## Dashboard

### 機能

- 本日のタスク数
- 完了率
- 期限間近タスク
- 最近の更新
- プロジェクト一覧
- ミニカレンダー
- クイックアクション

---

## Project List

### 機能

- プロジェクト一覧
- 検索
- フィルター
- ソート
- 新規作成
- ステータス表示

---

## Project Detail

### 機能

- プロジェクト情報
- メンバー
- タスク一覧
- 進捗率
- アクティビティ

---

## Task Board

### 機能

- Kanban表示
- ドラッグ&ドロップ
- ステータス変更
- タスク追加
- タスク編集

---

## Task Detail

### 機能

- タイトル
- 説明
- 担当者
- 期限
- コメント
- 添付ファイル
- チェックリスト
- 履歴

---

## Calendar

### 機能

- 月表示
- 週表示
- イベント表示
- タスク表示

---

## Analytics

### 機能

- 完了率
- 作業時間
- プロジェクト分析
- グラフ表示

---

## Settings

### 機能

- アカウント設定
- 通知設定
- テーマ設定
- ワークスペース設定

---

## Profile

### 機能

- プロフィール編集
- 活動履歴
- 統計表示

---

# 9. データ管理

## Project

保持する情報

- 名前
- 説明
- カラー
- ステータス
- 期限
- メンバー
- 進捗率

---

## Task

保持する情報

- タイトル
- 説明
- ステータス
- 優先度
- 担当者
- タグ
- 期限
- コメント数

---

## User

保持する情報

- 名前
- メールアドレス
- アイコン
- ロール

---

# 10. 非機能要件

## デザイン

- ダークテーマ
- モダンUI
- 海外SaaS風デザイン
- 高級感
- 十分な余白
- レスポンシブ対応
- アクセシビリティを考慮

## パフォーマンス

- 初回表示を高速化
- 適切なローディング表示
- Skeleton UI対応

## 保守性

- Feature First Architecture
- コンポーネント再利用
- 型安全
- ESLint
- Prettier

---

# 11. デザインコンセプト

参考サービス

- Linear
- Vercel Dashboard
- Notion
- Raycast
- GitHub Projects
- Apple

キーワード

- Premium
- Minimal
- Elegant
- Modern
- Productivity
- Dark UI

---

# 12. 対象外機能

本ポートフォリオでは以下は対象外とする。

- リアルタイム共同編集
- チャット機能
- メール通知
- プッシュ通知
- 決済機能
- 多言語対応
- モバイルネイティブアプリ

---

# 13. 成果物

本プロジェクトでは以下を成果物とする。

- ソースコード
- 要件定義書
- 基本設計書
- 詳細設計書
- データベース設計書
- API設計書
- コンポーネント設計書
- テスト設計書
- README
- デプロイ済みアプリケーション

---

# 14. 今後の設計ドキュメント

本書をもとに、以下の設計書を順次作成する。

- 02_basic_design.md
- 03_detail_design.md
- 04_architecture.md
- 05_database.md
- 06_api.md
- 07_screen_design.md
- 08_component_design.md
- 09_ui_guideline.md
- 10_directory_structure.md
- 11_development_rules.md
- 12_testing.md
- 13_deployment.md
- 14_roadmap.md
