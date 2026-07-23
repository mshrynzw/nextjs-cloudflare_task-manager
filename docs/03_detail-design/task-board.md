# Task Board画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-005

## 画面名

Task Board

## URL

```text
/projects/:projectId/board
```

## 目的

Task Board画面は、プロジェクト内のタスクをカンバン形式で管理する画面である。

ユーザーはタスクの追加・編集・移動・検索・フィルターを行い、プロジェクトの進捗を視覚的に把握できる。

---

# 2. レイアウト

```text
+--------------------------------------------------------------------------+
| Header                                                                   |
+-----------+--------------------------------------------------------------+
| Sidebar   | Breadcrumb                                                   |
|           |--------------------------------------------------------------|
|           | Search     Filter     Sort     New Task                      |
|           |--------------------------------------------------------------|
|           | Backlog | Todo | In Progress | Review | Done                 |
|           |         |      |             |        |                      |
|           |         |      |             |        |                      |
|           |         |      |             |        |                      |
|           |         |      |             |        |                      |
+-----------+--------------------------------------------------------------+
```

---

# 3. 使用コンポーネント

共通

- Sidebar
- Header
- Breadcrumb
- SearchInput
- FilterDropdown
- SortDropdown
- Dialog
- Toast

Kanban

- BoardColumn
- TaskCard
- AddTaskButton
- ColumnHeader
- ColumnFooter

その他

- AvatarGroup
- Badge
- PriorityBadge
- ProgressBar
- EmptyState
- Skeleton

---

# 4. カラム構成

初期表示

- Backlog
- Todo
- In Progress
- Review
- Done

各カラムには

- タイトル
- 件数
- Add Task ボタン

を表示する。

---

# 5. Task Card

表示項目

基本情報

- タイトル
- 説明（2行まで）
- タグ
- 優先度
- ステータス

担当者

- Avatar

期限

- Due Date

進捗

- Checklist Progress

その他

- コメント数
- 添付ファイル数

右上

- Context Menu

---

# 6. ドラッグ&ドロップ

対象

Task Card

ドラッグ可能範囲

列内

列間

ドロップ後

- ステータス更新
- Toast表示

アニメーション

- カード拡大
- Shadow強化
- Drop Animation

---

# 7. 検索

対象

- タイトル
- 説明
- タグ

リアルタイム検索を想定する。

---

# 8. Filter

対象

Priority

- High
- Medium
- Low

Status

- All

Member

Tag

Deadline

---

# 9. Sort

並び順

- Recently Updated
- Created Date
- Priority
- Deadline
- Title

---

# 10. New Task

Dialog表示

入力項目

- Title
- Description
- Priority
- Status
- Due Date
- Assignee
- Tags

保存

Toast表示。

---

# 11. Context Menu

Task Card右上

内容

- Open
- Edit
- Duplicate
- Move
- Archive
- Delete

DeleteのみDanger表示。

---

# 12. Empty State

カラム内にタスクが存在しない場合

表示

- アイコン
- メッセージ
- Add Taskボタン

例

```text
No tasks.

Create a task to get started.
```

---

# 13. Loading

Skeleton表示

対象

- Column
- Task Card
- Toolbar

---

# 14. Toast

成功

```text
Task created successfully.
```

移動

```text
Task moved.
```

削除

```text
Task deleted.
```

失敗

```text
Failed to update task.
```

---

# 15. Command Palette

ショートカット

```text
⌘ K
```

表示内容

- Search Task
- New Task
- Go to Dashboard
- Go to Calendar
- Go to Analytics

---

# 16. アニメーション

## 初回表示

GSAP

表示順

Header

↓

Toolbar

↓

Columns

↓

Task Cards

Task Cardは

Stagger Animation

---

## Hover

Task Card

- translateY(-4px)
- Scale 1.01
- Shadow強化

---

## Drag

ドラッグ中

- Scale 1.03
- Rotation 1°
- Shadow強化

ドロップ時

- Bounceなし
- Soft Ease

---

## Add Task

Dialog

Fade

Scale

---

## Filter

Cross Fade

---

# 17. レスポンシブ

Desktop

5列表示

横スクロールなしを基本とする。

---

Tablet

横スクロール対応

---

Mobile

1列表示

ステータス切替はSwipeまたはタブで行う。

SidebarはDrawerへ変更する。

Bottom Navigationを表示する。

---

# 18. アクセシビリティ

- キーボード操作対応
- ドラッグ操作の代替手段を提供
- aria-label設定
- Focus Ring表示
- スクリーンリーダー対応

---

# 19. 使用Hooks

```text
useBoard()

useTasks()

useTaskSearch()

useTaskFilter()

useTaskSort()

useDragAndDrop()
```

---

# 20. 使用Feature

```text
features/task

features/project
```

---

# 21. 使用予定コンポーネント

```text
BoardColumn

ColumnHeader

ColumnFooter

TaskCard

TaskDialog

TaskContextMenu

SearchInput

FilterDropdown

SortDropdown

PriorityBadge

AvatarGroup

Badge

ProgressBar

Dialog

Toast

Skeleton

EmptyState
```

---

# 22. 今後追加予定

- Swimlanes
- WIP Limit
- Card Cover Color
- Recurring Tasks
- AI Task Summary
- Time Tracking
- Dependencies
- Labels Management
- Bulk Edit
- Bulk Move
- Keyboard Shortcuts
- Board Templates
