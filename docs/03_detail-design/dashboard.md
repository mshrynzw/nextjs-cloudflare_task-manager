# Dashboard画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-002

## 画面名

Dashboard

## URL

```
/
```

（ログイン後のホーム画面）

---

# 2. 目的

Dashboardはログイン後に最初に表示される画面であり、ユーザーが現在の作業状況を短時間で把握できることを目的とする。

本画面では以下を提供する。

- 今日の作業状況
- プロジェクト概要
- タスク状況
- 最近の更新
- クイックアクション

---

# 3. レイアウト

```
+------------------------------------------------------------+
| Header                                                     |
+-----------+------------------------------------------------+
| Sidebar   | Welcome                                        |
|           |------------------------------------------------|
|           | KPI Cards                                      |
|           |------------------------------------------------|
|           | Recent Projects      Today's Tasks             |
|           |------------------------------------------------|
|           | Activity             Mini Calendar             |
|           |------------------------------------------------|
|           | Quick Actions                                 |
+-----------+------------------------------------------------+
```

---

# 4. 使用コンポーネント

## 共通

- Sidebar
- Header
- SearchBar
- NotificationButton
- UserMenu

## KPI

- StatCard

## Project

- ProjectCard

## Task

- TaskCard

## Activity

- ActivityItem

## Calendar

- MiniCalendar

## Action

- ActionButton

---

# 5. セクション構成

## 5.1 Header

表示内容

- ページタイトル
- 検索
- 通知
- コマンドパレット
- プロフィール

---

## 5.2 Welcome

表示内容

```
Good Morning

Let's make today productive.
```

ユーザー名を表示する。

---

## 5.3 KPI Cards

4枚表示する。

### Today Tasks

表示

```
18
```

説明

今日のタスク数

---

### Completed

表示

```
12
```

説明

本日完了

---

### Progress

表示

```
72%
```

Progress Barを表示する。

---

### Due Today

表示

```
5
```

期限当日タスク

---

# 6. Project Section

表示件数

4件

表示内容

- 名前
- カラー
- Progress
- Deadline
- Members
- Openボタン

クリックすると

```
Project Detail
```

へ遷移する。

---

# 7. Today's Tasks

表示件数

5件

表示内容

- Title
- Priority
- Deadline
- Status
- Assignee

---

# 8. Recent Activity

表示件数

10件

表示内容

- Avatar
- User
- Action
- Project
- Time

例

```
John moved "Landing Page"
to Done.
```

---

# 9. Mini Calendar

表示

- 今月

表示内容

- タスク件数
- イベント

クリックで

Calendar画面へ遷移。

---

# 10. Quick Actions

ボタン一覧

- New Project
- New Task
- Invite Member
- Open Calendar

---

# 11. サイドバー

項目

- Dashboard
- Projects
- Kanban
- Calendar
- Analytics
- Settings
- Profile

現在画面はActive表示。

折りたたみに対応する。

---

# 12. 検索

リアルタイム検索を想定。

検索対象

- プロジェクト
- タスク

ショートカット

```
⌘ K
```

Command Paletteを表示する。

---

# 13. 通知

表示

Bell Icon

クリック

Dropdown表示

表示件数

5件

---

# 14. User Menu

表示

Avatar

クリック

Dropdown

内容

- Profile
- Settings
- Logout

---

# 15. Empty State

Projectが0件の場合

表示

- SVG Illustration
- メッセージ
- New Project Button

---

# 16. Loading

Skeleton

表示対象

- KPI
- Card
- Project
- Activity
- Calendar

---

# 17. Toast

成功

```
Project created.
```

失敗

```
Failed to load projects.
```

---

# 18. アニメーション

## 初回表示

GSAP

順番

Background

↓

Sidebar

↓

Header

↓

Welcome

↓

KPI

↓

Projects

↓

Activity

↓

Calendar

↓

Quick Actions

すべてStagger表示。

---

## Hover

Card

```
translateY(-6px)
```

Scale

```
1.01
```

Shadowを強くする。

---

## KPI

数字

Count Up Animation

---

## Progress

Barが左から伸びる。

---

## Sidebar

Expand

Collapse

Animation

---

## Dropdown

Fade

Scale

---

# 19. レスポンシブ

Desktop

4列

---

Tablet

2列

---

Mobile

1列

SidebarはDrawer化する。

Bottom Navigationを表示する。

---

# 20. アクセシビリティ

- キーボード操作
- Skip Navigation
- aria-label
- Focus Ring
- 高コントラスト

---

# 21. 使用Hooks

```
useDashboard()

useProjects()

useTasks()

useNotifications()

useCommandPalette()
```

---

# 22. 使用Feature

```
features/dashboard

features/project

features/task

features/calendar

features/notification
```

---

# 23. 今後追加予定

- AI Summary
- Productivity Score
- Weather Widget
- Pomodoro Timer
- Team Activity
- Recent Files
- Favorite Projects
- Drag & Drop Widget
