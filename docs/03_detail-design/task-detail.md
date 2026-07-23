# Task Detail画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-006

## 画面名

Task Detail

## URL

```text
/projects/:projectId/tasks/:taskId
```

## 目的

Task Detail画面は、タスクの詳細情報を表示・編集し、コメントやチェックリストなどを管理する画面である。

Task Boardから遷移し、タスクに関するすべての情報を一元的に管理できる。

---

# 2. レイアウト

```text
+--------------------------------------------------------------------------+
| Header                                                                   |
+-----------+--------------------------------------------------------------+
| Sidebar   | Breadcrumb                                                   |
|           |--------------------------------------------------------------|
|           | Title                           Status Badge                 |
|           |--------------------------------------------------------------|
|           | Description                                            Edit  |
|           |--------------------------------------------------------------|
|           | Checklist                     Task Information               |
|           |--------------------------------------------------------------|
|           | Comments                     Activity Timeline               |
+-----------+--------------------------------------------------------------+
```

---

# 3. 使用コンポーネント

共通

- Sidebar
- Header
- Breadcrumb
- Dialog
- Toast
- Tooltip

Task

- TaskHeader
- TaskDescription
- Checklist
- ChecklistItem
- TaskInfoCard
- StatusBadge
- PriorityBadge

Comment

- CommentList
- CommentItem
- CommentEditor

Activity

- ActivityTimeline

その他

- AvatarGroup
- FileList
- Skeleton
- EmptyState

---

# 4. Breadcrumb

表示例

```text
Dashboard / Website Renewal / Task Board / Landing Page Design
```

---

# 5. Task Header

表示内容

- タイトル
- ステータス
- 優先度
- 編集ボタン

Context Menu

- Edit
- Duplicate
- Move
- Archive
- Delete

---

# 6. Description

表示内容

- Markdown対応（将来）
- リンク
- コードブロック（将来）
- 箇条書き

初期実装では通常テキストとする。

---

# 7. Task Information

表示内容

- Project
- Assignee
- Reporter
- Status
- Priority
- Tags
- Start Date
- Due Date
- Created At
- Updated At

---

# 8. Checklist

表示内容

- Checkbox
- タイトル
- 完了数

例

```text
☑ Create wireframe

☐ Implement layout

☐ QA review
```

Progressを表示する。

---

# 9. Attachments

表示内容

- ファイル名
- サイズ
- 更新日時

アイコン表示

- PDF
- Image
- ZIP
- Document

---

# 10. Comments

表示件数

20件まで表示

表示内容

- Avatar
- User
- Date
- Comment

下部

Comment Editor

入力

- Markdown（将来）
- メンション（将来）

---

# 11. Activity Timeline

表示内容

- Task Created
- Status Changed
- Comment Added
- Checklist Updated
- Assignee Changed

例

```text
Emily changed status from

Todo

to

In Progress

2 hours ago
```

---

# 12. Dialog

Edit Task

入力項目

- Title
- Description
- Priority
- Status
- Assignee
- Due Date
- Tags

保存後

Toast表示。

---

# 13. Empty State

Checklist

```text
No checklist yet.

Create your first checklist item.
```

Comments

```text
No comments yet.

Start the discussion.
```

Attachments

```text
No attachments.
```

---

# 14. Loading

Skeleton表示

対象

- Header
- Description
- Checklist
- Comments
- Activity

---

# 15. Toast

成功

```text
Task updated successfully.
```

コメント

```text
Comment added.
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

# 16. アニメーション

## 初回表示

GSAP

表示順

Header

↓

Task Header

↓

Description

↓

Checklist

↓

Task Info

↓

Comments

↓

Timeline

すべてFade + Stagger

---

## Hover

Card

- translateY(-2px)

Button

- Scale 1.02

Checklist

チェック時

- Check Animation
- Progress更新

Comment追加

下からFade

---

## Dialog

Fade

Scale

---

# 17. レスポンシブ

Desktop

2カラム

左

- Description
- Checklist
- Comments

右

- Information
- Activity

Tablet

1カラム

Mobile

縦並び

SidebarはDrawerへ変更する。

Bottom Navigationを表示する。

---

# 18. アクセシビリティ

- キーボード操作対応
- Focus Ring表示
- aria-label設定
- スクリーンリーダー対応
- コメント送信をEnter操作で実行可能

---

# 19. 使用Hooks

```text
useTask()

useTaskDetail()

useChecklist()

useComments()

useActivity()
```

---

# 20. 使用Feature

```text
features/task

features/comment

features/activity

features/file
```

---

# 21. 使用予定コンポーネント

```text
TaskHeader

TaskDescription

TaskInfoCard

Checklist

ChecklistItem

CommentList

CommentItem

CommentEditor

ActivityTimeline

PriorityBadge

StatusBadge

AvatarGroup

FileList

Dialog

Toast

Skeleton

EmptyState
```

---

# 22. 将来追加予定

- Markdown Editor
- @Mention
- Emoji Reaction
- File Upload
- Time Tracking
- AI Task Summary
- Related Tasks
- Task Dependencies
- Watchers
- Version History
- Share Task
- Full Screen Mode
