# Project Detail画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-004

## 画面名

Project Detail

## URL

```text
/projects/:projectId
```

## 目的

Project Detail画面は、プロジェクト全体の状況を確認するためのダッシュボードとして機能する。

タスク管理だけでなく、プロジェクトの進捗、メンバー、期限、アクティビティなどを一覧で確認できることを目的とする。

---

# 2. レイアウト

```text
+------------------------------------------------------------------+
| Header                                                           |
+-----------+------------------------------------------------------+
| Sidebar   | Breadcrumb                                           |
|           |------------------------------------------------------|
|           | Project Header                                       |
|           |------------------------------------------------------|
|           | KPI Cards                                            |
|           |------------------------------------------------------|
|           | Recent Tasks        Members                          |
|           |------------------------------------------------------|
|           | Activity           Deadline                          |
|           |------------------------------------------------------|
|           | Quick Actions                                        |
+-----------+------------------------------------------------------+
```

---

# 3. 使用コンポーネント

共通

- Sidebar
- Header
- Breadcrumb
- Dropdown Menu
- Dialog
- Toast

Project

- ProjectHero
- ProjectStatusBadge
- ProjectInfoCard
- ProgressCard
- StatCard

Task

- TaskList
- TaskRow

Member

- AvatarGroup
- MemberCard

Activity

- ActivityTimeline

その他

- QuickActionCard
- Skeleton
- EmptyState

---

# 4. Breadcrumb

表示例

```text
Dashboard / Projects / Website Renewal
```

クリックで各画面へ戻る。

---

# 5. Project Header

表示内容

- Project Name
- Description
- Color
- Status
- Priority
- Deadline
- Created Date
- Last Updated

右上に

- Edit
- Archive
- Delete

メニューを配置する。

---

# 6. KPI Cards

表示枚数

4枚

表示内容

### Progress

```text
72%
```

Progress Bar付き。

---

### Total Tasks

```text
48
```

---

### Completed

```text
31
```

---

### Members

```text
8
```

---

# 7. Project Information

表示内容

- Client
- Owner
- Repository
- Workspace
- Start Date
- Deadline
- Visibility

Repository はGitHubアイコン付きリンクで表示する。

---

# 8. Recent Tasks

表示件数

5件

表示内容

- Task Name
- Status
- Priority
- Deadline
- Assignee

「View All」を押すと Task Board へ遷移する。

---

# 9. Members

表示内容

- Avatar
- Name
- Role
- Online Status

クリックすると Profile画面へ遷移する。

---

# 10. Activity Timeline

表示件数

10件

例

```text
Emily completed "Landing Page Design"

2 hours ago
```

表示内容

- Avatar
- User
- Action
- Time

---

# 11. Deadline

表示内容

- Start Date
- Due Date
- Remaining Days

期限までの日数を表示する。

期限切れの場合は赤色表示。

---

# 12. Quick Actions

表示内容

- New Task
- Open Kanban
- Calendar
- Analytics
- Invite Member

---

# 13. Context Menu

Project Header右上

内容

- Edit Project
- Duplicate
- Archive
- Delete

DeleteはDanger表示。

---

# 14. Dialog

Edit Project

入力項目

- Name
- Description
- Color
- Status
- Priority
- Deadline

保存後

Toast表示。

---

# 15. Empty State

Taskが存在しない場合

表示

- SVG Illustration
- Message
- Create Task Button

例

```text
No tasks yet.

Create your first task to get started.
```

---

# 16. Loading

Skeleton表示

対象

- Header
- KPI
- Members
- Tasks
- Activity

---

# 17. Toast

成功

```text
Project updated successfully.
```

削除

```text
Project archived.
```

失敗

```text
Failed to update project.
```

---

# 18. アニメーション

## 初回表示

GSAP

順番

Header

↓

Breadcrumb

↓

Project Header

↓

KPI

↓

Tasks

↓

Members

↓

Activity

↓

Quick Actions

すべて Stagger Animation。

---

## Hover

Card

- translateY(-4px)
- Shadow強化

Button

- Scale 1.02

Avatar

- Ring表示

---

## Progress

左から伸びるアニメーション。

---

## Dialog

Fade

Scale

---

## Timeline

下からフェードイン。

---

# 19. レスポンシブ

Desktop

2カラムレイアウト

---

Tablet

1〜2カラム

---

Mobile

1カラム

SidebarはDrawerへ変更する。

Bottom Navigationを表示する。

---

# 20. アクセシビリティ

- キーボード操作対応
- Focus Ring表示
- aria-label設定
- コントラスト比を考慮
- スクリーンリーダー対応

---

# 21. 使用Hooks

```text
useProject()

useProjectMembers()

useProjectTasks()

useProjectActivity()
```

---

# 22. 使用Feature

```text
features/project

features/task

features/member

features/activity
```

---

# 23. 使用予定コンポーネント

```text
ProjectHero

ProjectHeader

ProjectInfoCard

StatCard

TaskList

TaskRow

MemberCard

AvatarGroup

ActivityTimeline

QuickActionCard

ProgressBar

Badge

Dialog

Toast

Skeleton

EmptyState
```

---

# 24. 今後追加予定

- Project Cover Image
- Project Notes
- Milestones
- Burndown Chart
- Budget
- Time Tracking
- File Manager
- AI Project Summary
- GitHub Integration
- Slack Integration
