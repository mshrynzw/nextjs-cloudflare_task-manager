# Profile画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-010

## 画面名

Profile

## URL

```text
/profile/:userId
```

## 目的

Profile画面は、ユーザーのプロフィール情報、担当タスク、参加プロジェクト、活動履歴などを確認するための画面である。

自分自身のプロフィールだけでなく、プロジェクトメンバーの情報も閲覧でき、チーム内での役割や活動状況を把握できる。

---

# 2. レイアウト

```text
+--------------------------------------------------------------------------+
| Header                                                                   |
+-----------+--------------------------------------------------------------+
| Sidebar   | Breadcrumb                                                   |
|           |--------------------------------------------------------------|
|           | Profile Header                                               |
|           |--------------------------------------------------------------|
|           | Overview Cards                                               |
|           |--------------------------------------------------------------|
|           | Assigned Tasks            Recent Activity                    |
|           |--------------------------------------------------------------|
|           | Projects                  Skills & Tags                      |
+-----------+--------------------------------------------------------------+
```

---

# 3. 使用コンポーネント

共通

- Sidebar
- Header
- Breadcrumb
- Tabs
- Dialog
- Toast

Profile

- ProfileHeader
- UserCard
- StatsCard
- SkillsCard
- SocialLinks

Task

- TaskList
- TaskRow

Project

- ProjectCard

Activity

- ActivityTimeline

その他

- Avatar
- Badge
- ProgressBar
- Skeleton
- EmptyState

---

# 4. Breadcrumb

表示例

```text
Dashboard / Members / Emily Johnson
```

---

# 5. Profile Header

表示内容

- Avatar
- Display Name
- Username
- Job Title
- Bio
- Online Status

右側

- Edit Profile（自分のみ）
- Message（将来）
- More Menu

---

# 6. Overview Cards

表示枚数

4枚

### Assigned Tasks

```text
24
```

---

### Completed Tasks

```text
186
```

---

### Active Projects

```text
6
```

---

### Completion Rate

```text
92%
```

---

# 7. User Information

表示内容

- Email（本人のみ表示）
- Time Zone
- Language
- Joined Date
- Role

Role例

- Admin
- Member
- Viewer

---

# 8. Assigned Tasks

表示件数

10件

表示内容

- Title
- Project
- Status
- Priority
- Due Date

クリックするとTask Detailへ遷移する。

---

# 9. Recent Activity

表示件数

20件

例

```text
Completed "Landing Page Design"

2 hours ago
```

表示内容

- Action
- Project
- Date

---

# 10. Projects

参加プロジェクト一覧

表示内容

- Project Name
- Status
- Progress
- Role

クリックするとProject Detailへ遷移する。

---

# 11. Skills & Tags

表示内容

タグ形式

例

- Frontend
- Backend
- UI Design
- React
- TypeScript
- Next.js

---

# 12. Social Links

表示項目

- GitHub
- Website
- LinkedIn（将来）
- X（将来）

設定されていない項目は非表示とする。

---

# 13. Dialog

Edit Profile

入力項目

- Display Name
- Job Title
- Bio
- Website
- GitHub
- Avatar

保存後

Toast表示。

---

# 14. Empty State

Assigned Tasks

```text
No assigned tasks.
```

Projects

```text
No active projects.
```

Activity

```text
No recent activity.
```

---

# 15. Loading

Skeleton表示

対象

- Header
- Cards
- Tasks
- Projects
- Activity

---

# 16. Toast

成功

```text
Profile updated successfully.
```

失敗

```text
Failed to update profile.
```

---

# 17. アニメーション

## 初回表示

GSAP

表示順

Header

↓

Profile Header

↓

Overview

↓

Tasks

↓

Projects

↓

Activity

Fade + Stagger

---

## Hover

Project Card

- translateY(-3px)
- Shadow強化

Task Row

背景色変更

Avatar

Scale 1.05

---

## Dialog

Fade

Scale

---

## Count Up

Overview Cards

数値をCount Up表示する。

---

# 18. レスポンシブ

Desktop

2カラム

左

- Tasks
- Projects

右

- Activity
- Skills

---

Tablet

1〜2カラム

---

Mobile

1カラム

Profile Headerは縦並びに変更する。

SidebarはDrawerへ変更する。

Bottom Navigationを表示する。

---

# 19. アクセシビリティ

- キーボード操作対応
- Focus Ring表示
- aria-label設定
- スクリーンリーダー対応
- Avatarに代替テキストを設定

---

# 20. 権限制御

本人のプロフィール

- 編集可能
- Email表示
- プロフィール編集ボタン表示

他ユーザーのプロフィール

- 閲覧のみ
- Email非表示
- 編集不可

管理者

- ロール情報を閲覧可能
- ユーザー状態を確認可能

---

# 21. 使用Hooks

```text
useProfile()

useUserProjects()

useAssignedTasks()

useUserActivity()
```

---

# 22. 使用Feature

```text
features/profile

features/user

features/task

features/project

features/activity
```

---

# 23. 使用予定コンポーネント

```text
ProfileHeader

UserCard

StatsCard

TaskList

TaskRow

ProjectCard

ActivityTimeline

SkillsCard

SocialLinks

Avatar

Badge

ProgressBar

Dialog

Toast

Skeleton

EmptyState
```

---

# 24. 将来追加予定

- フォロー機能
- プロフィールカバー画像
- バッジ・実績表示
- 作業時間の統計
- 週間アクティビティグラフ
- AIによるプロフィール要約
- ステータスメッセージ
- 公開プロフィールURL
- カスタムプロフィールテーマ
- ポートフォリオリンク
