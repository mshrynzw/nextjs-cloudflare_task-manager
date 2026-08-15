# API Design

Version: 1.0

---

# 1. Overview

本ドキュメントは、Task ManagerにおけるAPIの仕様を定義する。

APIはNext.js App RouterのRoute Handlersを使用して実装する。

APIはUIコンポーネントから直接データベースへアクセスせず、API層またはServer Actionsを介してデータアクセスを行う。

---

# 2. API Architecture

基本的なデータフローは以下とする。

```text
Browser
   │
   ▼
React / Next.js
   │
   ├── Server Component
   │
   ├── Client Component
   │
   └── TanStack Query
          │
          ▼
     Route Handler
          │
          ▼
      Service Layer
          │
          ▼
       Repository
          │
          ▼
      Drizzle ORM
          │
          ▼
     Cloudflare D1
```

API層では以下の責務を持つ。

- HTTPリクエストの受付
- 認証・認可
- 入力値検証
- Service呼び出し
- HTTPレスポンス生成
- エラーハンドリング

ビジネスロジックはRoute Handlerに直接記述しない。

---

# 3. Base URL

開発環境

```text
http://localhost:3000
```

本番環境

```text
https://<production-domain>
```

API Base Path

```text
/api/v1
```

---

# 4. API Versioning

APIはURLによるバージョニングを採用する。

```text
/api/v1/...
```

将来的に破壊的変更が必要になった場合は、

```text
/api/v2/...
```

を追加する。

既存APIのレスポンス形式を、互換性を保てない状態で変更してはならない。

---

# 5. Authentication

認証にはAuth.jsを使用する。

認証済みユーザーのみ利用可能なAPIでは、必ずSessionを検証する。

```text
Request
   │
   ▼
Session Check
   │
   ├── Unauthorized
   │       │
   │       ▼
   │     401
   │
   └── Authenticated
           │
           ▼
       Authorization
           │
           ▼
        Service
```

---

# 6. Authentication API

Auth.jsが提供する認証エンドポイントについては、Auth.jsの仕様に従う。

アプリケーション独自のAPIとして、認証状態確認APIを提供する。

## GET /api/v1/auth/session

現在のログインユーザー情報を取得する。

### Response

```json
{
  "user": {
    "id": "user_01",
    "name": "John Doe",
    "email": "john@example.com",
    "image": null
  }
}
```

未認証の場合は `401 Unauthorized` を返す。

## POST /api/v1/auth/register

Email + Password で新規ユーザーを作成する（セッションは発行しない）。

クライアントは成功後に `next-auth/react` の `signIn("credentials")` でログインする。

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response `201`

```json
{
  "data": {
    "email": "user@example.com"
  }
}
```

### Errors

| Status | 条件 |
| ------ | ---- |
| 422 | 入力不正 / Email 認証無効 |
| 409 | 登録できないメール（既存の可能性） |
| 429 | レート制限 |

---

# 7. Users API

## GET /api/v1/users/:userId

ユーザー情報を取得する。

### Path Parameters

| Parameter | Type   | Required |
| --------- | ------ | -------- |
| userId    | string | Yes      |

### Response

```json
{
  "id": "user_01",
  "name": "John Doe",
  "username": "john",
  "image": null,
  "jobTitle": "Frontend Developer",
  "bio": "Frontend developer.",
  "role": "member"
}
```

セキュリティ上、他ユーザーのプロフィールではメールアドレスなどの非公開情報を返さない。

---

## PATCH /api/v1/users/:userId

プロフィールを更新する。

### Request

```json
{
  "name": "John Doe",
  "jobTitle": "Senior Frontend Developer",
  "bio": "Frontend developer.",
  "website": "https://example.com"
}
```

### Response

```json
{
  "data": {
    "id": "user_01",
    "name": "John Doe",
    "jobTitle": "Senior Frontend Developer",
    "bio": "Frontend developer."
  }
}
```

---

# 8. Projects API

## GET /api/v1/projects

プロジェクト一覧を取得する。

### Query Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| page      | number | ページ番号  |
| limit     | number | 取得件数    |
| search    | string | 検索文字列  |
| status    | string | ステータス  |
| priority  | string | 優先度      |
| memberId  | string | メンバー    |
| tag       | string | タグ        |
| sort      | string | ソート項目  |
| order     | string | asc / desc  |

### Example

```text
GET /api/v1/projects?page=1&limit=20&status=active&sort=updatedAt&order=desc
```

### Response

```json
{
  "data": [
    {
      "id": "project_01",
      "name": "Website Redesign",
      "description": "Company website redesign.",
      "status": "active",
      "priority": "high",
      "visibility": "workspace",
      "progress": 72,
      "deadline": "2026-09-30",
      "taskCount": 48,
      "completedTaskCount": 31,
      "members": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## POST /api/v1/projects

新しいプロジェクトを作成する。

### Request

```json
{
  "workspaceId": "workspace_01",
  "name": "Website Redesign",
  "description": "Company website redesign.",
  "status": "planning",
  "priority": "medium",
  "deadline": "2026-09-30",
  "color": "#4f7cff",
  "visibility": "workspace",
  "memberIds": ["user_02"]
}
```

`workspaceId` は省略可能。省略時は、認証ユーザーが所属する Workspace を自動選択する。

`visibility` は省略可能。省略時は `workspace`（ワークスペース内公開）。`members` を指定すると、プロジェクトメンバー以外には非公開になる。

`memberIds` は省略可能。作成者は自動で Owner になる。指定したユーザーは同じワークスペースのメンバーである必要があり、`member` ロールで追加される。

### Response

```json
{
  "data": {
    "id": "project_01",
    "name": "Website Redesign",
    "status": "planning",
    "priority": "medium"
  }
}
```

---

## GET /api/v1/projects/:projectId

プロジェクト詳細を取得する。

### Response

```json
{
  "data": {
    "id": "project_01",
    "name": "Website Redesign",
    "description": "Company website redesign.",
    "status": "active",
    "priority": "high",
    "visibility": "workspace",
    "progress": 72,
    "deadline": "2026-09-30",
    "members": [],
    "taskSummary": {
      "total": 48,
      "completed": 31,
      "inProgress": 10,
      "todo": 7
    }
  }
}
```

---

## PATCH /api/v1/projects/:projectId

プロジェクトを更新する。

### Request

```json
{
  "name": "Website Redesign v2",
  "status": "active",
  "priority": "high",
  "deadline": "2026-10-15",
  "visibility": "members"
}
```

---

## DELETE /api/v1/projects/:projectId

プロジェクトをアーカイブする。

削除前に権限を確認する。Owner のみ実行可能。

実装では物理削除ではなく `archived_at` / `status=archived` による Soft Archive を行う。

### Response

```json
{
  "data": {
    "deleted": true
  }
}
```

---

# 9. Project Members API

## GET /api/v1/projects/:projectId/members

プロジェクトメンバーを取得する。

### Response

```json
{
  "data": [
    {
      "id": "user_01",
      "name": "John Doe",
      "role": "owner"
    },
    {
      "id": "user_02",
      "name": "Emily Smith",
      "role": "member"
    }
  ]
}
```

---

## POST /api/v1/projects/:projectId/members

プロジェクトへユーザーを追加する。Owner のみ実行可能。対象ユーザーは同じワークスペースのメンバーである必要がある。既に参加している場合は 409 を返す。

### Request

```json
{
  "userId": "user_02",
  "role": "member"
}
```

---

## DELETE /api/v1/projects/:projectId/members/:userId

プロジェクトからユーザーを削除する。Owner のみ実行可能。最後の Owner は削除できない。

---

# 9.1 Workspace Members API

## GET /api/v1/workspaces/:workspaceId/members

ワークスペースメンバーを取得する。プロジェクトメンバー追加の候補一覧と設定画面で使う。メールアドレスは返さない。

ワークスペースメンバーのみ実行可能。

### Response

```json
{
  "data": [
    {
      "id": "user_01",
      "name": "John Doe",
      "image": null,
      "role": "owner"
    }
  ]
}
```

---

## POST /api/v1/workspaces/:workspaceId/members

ワークスペースへ登録済みユーザーを追加する。Workspace Owner のみ実行可能。対象は既存アカウントで、メールアドレスで指定する。未登録ユーザーへの招待は行わない。既に参加している場合は 409 を返す。ユーザーが存在しない場合は 404 を返す。

### Request

```json
{
  "email": "member@example.com",
  "role": "member"
}
```

`role` は `owner` / `member` / `viewer`。省略時は `member`。

### Response

```json
{
  "data": {
    "id": "user_02",
    "name": "Emily Smith",
    "image": null,
    "role": "member"
  }
}
```

---

## PATCH /api/v1/workspaces/:workspaceId/members/:userId

ワークスペースメンバーのロールを変更する。Workspace Owner のみ実行可能。最後の Owner のロールは変更できない。

### Request

```json
{
  "role": "viewer"
}
```

---

## DELETE /api/v1/workspaces/:workspaceId/members/:userId

ワークスペースからユーザーを削除する。Workspace Owner のみ実行可能。最後の Owner は削除できない。

削除時は、そのワークスペース内のプロジェクトメンバーシップも削除し、担当タスクの `assignee_id` を未割り当てにする。

---

# 10. Tasks API

## GET /api/v1/projects/:projectId/tasks

プロジェクト内のタスクを取得する。

### Query Parameters

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| status     | string | ステータス  |
| priority   | string | 優先度      |
| assigneeId | string | 担当者      |
| tag        | string | タグ        |
| search     | string | 検索        |
| dueBefore  | string | 期限以前    |
| dueAfter   | string | 期限以降    |
| sort       | string | ソート      |
| order      | string | asc / desc  |

### Response

```json
{
  "data": [
    {
      "id": "task_01",
      "title": "Create landing page",
      "status": "in_progress",
      "priority": "high",
      "assignee": {
        "id": "user_01",
        "name": "John Doe"
      },
      "dueDate": "2026-08-20",
      "tags": ["frontend", "design"]
    }
  ],
  "meta": {
    "total": 1
  }
}
```

---

## POST /api/v1/projects/:projectId/tasks

タスクを作成する。

### Request

```json
{
  "title": "Create landing page",
  "description": "Implement the new landing page.",
  "status": "todo",
  "priority": "high",
  "assigneeId": "user_01",
  "dueDate": "2026-08-20",
  "tags": ["frontend", "design"]
}
```

---

# 11. Task Detail API

## GET /api/v1/tasks/:taskId

タスク詳細を取得する。

### Response

```json
{
  "data": {
    "id": "task_01",
    "title": "Create landing page",
    "description": "Implement the new landing page.",
    "status": "in_progress",
    "priority": "high",
    "projectId": "project_01",
    "assigneeId": "user_01",
    "dueDate": "2026-08-20",
    "tags": [],
    "checklist": [],
    "comments": []
  }
}
```

---

## PATCH /api/v1/tasks/:taskId

タスクを更新する。

### Request

```json
{
  "title": "Create landing page",
  "status": "review",
  "priority": "high",
  "assigneeId": "user_02",
  "dueDate": "2026-08-22"
}
```

---

## DELETE /api/v1/tasks/:taskId

タスクを削除する。

---

# 12. Task Status API

Kanban Boardでのステータス変更に使用する。

## PATCH /api/v1/tasks/:taskId/status

### Request

```json
{
  "status": "done"
}
```

### Response

```json
{
  "data": {
    "id": "task_01",
    "status": "done"
  }
}
```

ステータス変更時にはActivity Logを作成する。

---

# 13. Task Position API

Kanban Boardでのドラッグ&ドロップに使用する。

## PATCH /api/v1/tasks/:taskId/position

### Request

```json
{
  "status": "in_progress",
  "position": 3
}
```

### Response

```json
{
  "data": {
    "id": "task_01",
    "status": "in_progress",
    "position": 3
  }
}
```

位置情報は数値または並び順を表現できる方式で管理する。

---

# 14. Checklist API

## GET /api/v1/tasks/:taskId/checklist

チェックリストを取得する。

---

## POST /api/v1/tasks/:taskId/checklist

チェックリスト項目を追加する。

### Request

```json
{
  "title": "Create wireframe"
}
```

---

## PATCH /api/v1/checklist/:checklistId

チェックリスト項目を更新する。

### Request

```json
{
  "completed": true
}
```

---

## DELETE /api/v1/checklist/:checklistId

チェックリスト項目を削除する。

---

# 15. Comments API

## GET /api/v1/tasks/:taskId/comments

コメント一覧を取得する。

---

## POST /api/v1/tasks/:taskId/comments

コメントを追加する。

### Request

```json
{
  "content": "The design looks good."
}
```

### Response

```json
{
  "data": {
    "id": "comment_01",
    "content": "The design looks good.",
    "author": {
      "id": "user_01",
      "name": "John Doe"
    },
    "createdAt": "2026-08-08T08:00:00Z"
  }
}
```

---

## PATCH /api/v1/comments/:commentId

コメントを編集する。

---

## DELETE /api/v1/comments/:commentId

コメントを削除する。

コメントの編集・削除は、原則として投稿者本人または適切な管理権限を持つユーザーのみ可能とする。

---

# 16. Calendar API

## GET /api/v1/calendar/events

カレンダー表示用のイベントを取得する。

### Query Parameters

| Parameter  | Type   | Description  |
| ---------- | ------ | ------------ |
| start      | string | 開始日       |
| end        | string | 終了日       |
| projectId  | string | プロジェクト |
| assigneeId | string | 担当者       |

### Example

```text
GET /api/v1/calendar/events?start=2026-08-01&end=2026-08-31
```

### Response

```json
{
  "data": [
    {
      "id": "task_01",
      "type": "task",
      "title": "Create landing page",
      "start": "2026-08-20",
      "end": "2026-08-20",
      "priority": "high",
      "projectId": "project_01"
    }
  ]
}
```

---

# 17. Analytics API

## GET /api/v1/analytics/overview

分析用のKPIを取得する。

### Query Parameters

| Parameter | Type   | Description  |
| --------- | ------ | ------------ |
| from      | string | 開始日       |
| to        | string | 終了日       |
| projectId | string | プロジェクト |

### Response

```json
{
  "data": {
    "totalTasks": 482,
    "completedTasks": 371,
    "completionRate": 77,
    "overdueTasks": 12,
    "activeMembers": 14,
    "averageCompletionTime": 3.8
  }
}
```

---

## GET /api/v1/analytics/completion-trend

タスク完了数の推移を取得する。

### Response

```json
{
  "data": [
    {
      "date": "2026-08-01",
      "created": 12,
      "completed": 8
    },
    {
      "date": "2026-08-02",
      "created": 15,
      "completed": 11
    }
  ]
}
```

---

## GET /api/v1/analytics/task-distribution

タスクのステータス別分布を取得する。

### Response

```json
{
  "data": [
    {
      "status": "backlog",
      "count": 20
    },
    {
      "status": "todo",
      "count": 32
    },
    {
      "status": "in_progress",
      "count": 18
    },
    {
      "status": "review",
      "count": 11
    },
    {
      "status": "done",
      "count": 80
    }
  ]
}
```

---

## GET /api/v1/analytics/member-workload

メンバーごとの作業量を取得する。

### Response

```json
{
  "data": [
    {
      "userId": "user_01",
      "name": "John Doe",
      "assignedTasks": 24,
      "completedTasks": 18
    }
  ]
}
```

---

# 18. Notifications API

## GET /api/v1/notifications

通知一覧を取得する。タスクに紐づく通知は、対象プロジェクトを閲覧できる場合のみ返す。非公開プロジェクト（`visibility = members`）の通知は、プロジェクトメンバー以外には返さない。

### Query Parameters

```text
page
limit
unreadOnly
```

---

## PATCH /api/v1/notifications/:notificationId/read

通知を既読にする。

---

## POST /api/v1/notifications/read-all

すべての通知を既読にする。

---

# 19. Settings API

## GET /api/v1/settings

現在のユーザー設定を取得する。

---

## PATCH /api/v1/settings

ユーザー設定を更新する。

### Request

```json
{
  "theme": "dark",
  "accentColor": "blue",
  "density": "comfortable",
  "animations": true,
  "language": "ja"
}
```

`language` は `ja` または `en`。Appearance 保存時に Cookie `vantage_locale` と `users.language` の両方を更新する。UI の既定言語は日本語。

---

# 20. Profile API

Profile画面で使用するAPI。

## GET /api/v1/users/:userId/profile

プロフィール情報を取得する。

レスポンスには以下を含める。

- 基本プロフィール
- 担当タスク数
- 完了タスク数
- プロジェクト数
- 完了率
- 参加プロジェクト
- 最近のActivity
- Skills

---

# 21. Error Response

APIエラーは統一された形式で返す。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request.",
    "details": [
      {
        "field": "title",
        "message": "Title is required."
      }
    ]
  }
}
```

---

# 22. HTTP Status Codes

| Status | 用途                 |
| ------ | -------------------- |
| 200    | 成功                 |
| 201    | リソース作成成功     |
| 204    | 成功・レスポンスなし |
| 400    | 不正なリクエスト     |
| 401    | 未認証               |
| 403    | 権限不足             |
| 404    | リソース不存在       |
| 409    | 競合                 |
| 422    | バリデーションエラー |
| 429    | Rate Limit           |
| 500    | サーバーエラー       |

---

# 23. Error Codes

| Code             | Description          |
| ---------------- | -------------------- |
| UNAUTHORIZED     | 認証されていない     |
| FORBIDDEN        | 権限がない           |
| NOT_FOUND        | リソースが存在しない |
| VALIDATION_ERROR | 入力値が不正         |
| CONFLICT         | データが競合している |
| RATE_LIMITED     | リクエスト制限       |
| INTERNAL_ERROR   | 内部エラー           |

---

# 24. Validation

すべての外部入力はZodで検証する。

```text
Request
   │
   ▼
Zod Schema
   │
   ├── Invalid
   │      │
   │      ▼
   │     422
   │
   └── Valid
          │
          ▼
       Service
```

クライアント側のバリデーションだけを信頼してはいけない。

サーバー側でも必ず検証する。

---

# 25. Authorization

認証（Authentication）と認可（Authorization）を分離する。

## Authentication

「誰なのか」を確認する。

## Authorization

「そのユーザーが操作してよいか」を確認する。

例えばProject APIでは、

```text
Session
  ↓
User ID
  ↓
Workspace Membership
  ↓
Project Membership または visibility = workspace（閲覧）
  ↓
Project Membership + Role（変更）
  ↓
Operation
```

の順番で確認する。

公開プロジェクト（`visibility = workspace`）は、同じワークスペースのメンバーがプロジェクトメンバーでなくても閲覧できる。変更操作はプロジェクトメンバーのロールが必要。非公開プロジェクト（`visibility = members`）の閲覧はプロジェクトメンバーに限定する。`visibility` の変更は Owner のみ可能。

---

# 26. Permission

基本ロール

```text
owner
member
viewer
```

## Owner

- Project閲覧
- Project編集
- Project削除
- Task作成
- Task編集
- Task削除
- Project Member管理
- Workspace Member管理（Workspace Owner）

## Member

- Project閲覧
- Task作成
- Task編集
- コメント
- 自分のプロフィール編集

## Viewer

- Project閲覧
- Task閲覧
- コメント

---

# 27. Pagination

一覧APIではPaginationを使用する。

デフォルト

```text
page = 1
limit = 20
```

最大

```text
limit = 100
```

クライアントから100を超える値が指定された場合は100として扱う。

---

# 28. Filtering

FilterはQuery Parameterで指定する。

例

```text
/projects?status=active&priority=high
```

複数値が必要な場合はカンマ区切りを使用する。

```text
/projects?status=active,planning
```

---

# 29. Sorting

形式

```text
sort=updatedAt
order=desc
```

許可されていないSort項目はエラーとする。

---

# 30. Date / Time

APIでは日時をISO 8601形式で扱う。

例

```text
2026-08-08T08:30:00Z
```

日付のみの場合

```text
2026-08-08
```

タイムゾーンを持つ日時をAPIレスポンスで返す場合はUTCを基本とする。

---

# 31. API Security

以下を必須とする。

- Session検証
- Authorizationチェック
- Zodによる入力検証
- SQL Injection対策
- XSS対策
- CSRF対策
- Rate Limit
- セキュリティヘッダー

ユーザー入力をそのままHTMLとして出力してはいけない。

---

# 32. Database Access

Route Handlerから直接SQLを大量に記述しない。

以下の責務分離を採用する。

```text
Route Handler
      ↓
Service
      ↓
Repository
      ↓
Drizzle
      ↓
D1
```

### Route Handler

HTTP処理。

### Service

ビジネスロジック。

### Repository

データアクセス。

### Drizzle

ORM。

---

# 33. Transaction

複数のデータを同時に更新する処理ではTransactionを使用する。

例

Project削除時に関連データを処理する場合。

```text
Project
  ├── Tasks
  ├── Members
  └── Activity
```

一部だけ更新される状態を防ぐ。

---

# 34. Optimistic Update

Task Boardのドラッグ&ドロップなど、ユーザー操作に対して即座にUIを反映したい処理ではOptimistic Updateを検討する。

```text
User Drag
   ↓
UI Update
   ↓
API Request
   ↓
Success
   │
   └── Keep UI

Failure
   │
   └── Rollback
```

失敗時にはToastを表示する。

---

# 35. Caching

読み取り頻度が高く変更頻度が低いデータについてはキャッシュを利用する。

対象例

- Project List
- Project Detail
- Analytics
- Profile

ただし、ユーザーごとのデータを誤って共有キャッシュしないようにする。

---

# 36. TanStack Query

Client Componentで頻繁にデータ更新が発生する画面ではTanStack Queryを利用する。

主な対象

- Task Board
- Project List
- Comments
- Notifications
- Calendar

Query Keyは一貫した命名規則を採用する。

例

```text
["projects"]

["projects", projectId]

["projects", projectId, "tasks"]

["tasks", taskId]

["tasks", taskId, "comments"]
```

---

# 37. API and UI Mapping

| 画面           | 主要API                                       |
| -------------- | --------------------------------------------- |
| Login          | Auth.js                                       |
| Dashboard      | Projects / Tasks / Notifications / Analytics  |
| Project List   | Projects                                      |
| Project Detail | Projects / Tasks / Members / Activity         |
| Task Board     | Tasks                                         |
| Task Detail    | Tasks / Checklist / Comments / Activity       |
| Calendar       | Calendar Events                               |
| Analytics      | Analytics                                     |
| Settings       | Settings                                      |
| Profile        | Users / Profile / Projects / Tasks / Activity |

---

# 38. API Naming Rules

URLは複数形の名詞を基本とする。

推奨

```text
/projects
/tasks
/comments
/notifications
```

非推奨

```text
/getProjects
/createTask
/updateTask
```

HTTP Methodによって操作を表現する。

---

# 39. API Response Rules

成功時は原則として以下の形式を使用する。

単一リソース

```json
{
  "data": {}
}
```

複数リソース

```json
{
  "data": [],
  "meta": {}
}
```

エラー

```json
{
  "error": {}
}
```

レスポンス形式をEndpointごとに独自化しない。

---

# 40. Logging

サーバー側でAPIエラーを記録する。

ログには以下を含める。

- Timestamp
- Request ID
- Endpoint
- HTTP Method
- Status Code
- Error Code

パスワード、Session Token、アクセストークンなどの機密情報をログへ出力してはいけない。

---

# 41. Request ID

APIリクエストにはRequest IDを付与する。

エラー発生時にユーザーへ表示する場合は、

```text
Request ID: req_xxxxx
```

のように追跡可能にする。

---

# 42. Rate Limiting

将来的にCloudflare側でRate Limitingを導入する。

特に以下を重点的に制限する。

- Login
- Password Reset
- Comments
- Project Creation
- Task Creation
- Search

---

# 43. API Documentation

将来的にOpenAPI Specificationを導入する。

候補

```text
docs/openapi.yaml
```

または

```text
docs/openapi.json
```

を使用する。

API仕様と実装が乖離しないようにする。

---

# 44. Implementation Rules

CursorがAPIを実装する場合、以下を必ず守る。

1. 本ドキュメントを参照する。
2. 既存のAPI仕様を勝手に変更しない。
3. API追加時は本ドキュメントも更新する。
4. 入力値はZodで検証する。
5. 認証APIではSessionを検証する。
6. 認可チェックを行う。
7. Route Handlerにビジネスロジックを書きすぎない。
8. Service Layerを利用する。
9. Databaseへ直接アクセスする処理をUI Componentに書かない。
10. エラーレスポンス形式を統一する。
11. APIのテストを追加する。
12. 既存テストを壊さない。

---

# 45. Test Requirements

APIを追加・変更した場合はテストを追加する。

最低限以下をテストする。

## Success

- 正常なRequest
- 正常なResponse

## Validation

- 必須項目不足
- 不正な型
- 不正な値

## Authentication

- 未認証

## Authorization

- 権限不足
- 他ユーザーのリソースへのアクセス

## Not Found

- 存在しないID

## Conflict

- 重複データ

## Error

- Database Error
- Internal Error

テストコードはプロジェクト直下の

```text
tests/
```

配下に配置する。

---

# 46. API Implementation Status

現在、本ドキュメントに定義されているAPIの多くは設計段階であり、すべてが実装済みではない。

実装状況は以下の3段階で管理する。

```text
Planned
Implemented
Tested
```

APIを実装した場合は、このドキュメントと実装状況を更新する。

---

# 47. Future API

将来的に以下のAPIを追加する可能性がある。

- File Upload API
- Time Tracking API
- Webhook API
- Search API
- AI Summary API
- Project Template API
- Export API
- Import API
- Integration API
- Workspace API
- Audit Log API
