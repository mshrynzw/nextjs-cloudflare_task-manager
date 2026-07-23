# Calendar画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-007

## 画面名

Calendar

## URL

```text
/calendar
```

## 目的

Calendar画面は、タスクおよびプロジェクトの期限や予定をカレンダー形式で表示し、日・週・月単位でスケジュールを把握できることを目的とする。

Task Boardの補助画面として機能し、期限管理を視覚的に支援する。

---

# 2. レイアウト

```text
+------------------------------------------------------------------------+
| Header                                                                 |
+-----------+------------------------------------------------------------+
| Sidebar   | Toolbar                                                    |
|           |------------------------------------------------------------|
|           | Calendar (Month / Week / Day)         Agenda              |
|           |                                                            |
|           |                                                            |
|           |                                                            |
|           |                                                            |
|           |------------------------------------------------------------|
|           | Upcoming Tasks                                             |
+-----------+------------------------------------------------------------+
```

---

# 3. 使用コンポーネント

共通

- Sidebar
- Header
- Toolbar
- Dialog
- Toast

Calendar

- CalendarHeader
- CalendarGrid
- CalendarCell
- EventCard
- AgendaPanel
- MiniCalendar

Task

- TaskBadge
- PriorityBadge
- AvatarGroup

その他

- Skeleton
- EmptyState
- Tooltip

---

# 4. Toolbar

表示内容

- Today
- Previous
- Next
- Month
- Week
- Day
- Search
- Filter
- New Task

---

# 5. Calendar Header

表示内容

例

```text
August 2026
```

右側

- Previous Month
- Next Month

---

# 6. Month View

表示内容

- 日付
- タスク件数
- イベント
- 今日

タスクは最大3件表示。

4件以上は

```text
+5 more
```

を表示する。

---

# 7. Week View

表示内容

時間軸

```text
08:00

09:00

10:00

...
```

終日タスク

時間指定タスク

を区別する。

---

# 8. Day View

表示内容

1日の詳細スケジュール

- 時間
- タスク
- イベント

---

# 9. Agenda Panel

右側に表示

表示内容

- 今日
- 明日
- 今週

期限順に表示する。

各項目

- タイトル
- 時間
- Priority
- Project

---

# 10. Event Card

表示内容

- タイトル
- Color
- Time
- Priority
- Assignee

クリックすると

Task Detailへ遷移する。

---

# 11. Search

対象

- タスク名
- プロジェクト名
- タグ

リアルタイム検索を想定する。

---

# 12. Filter

対象

Status

Priority

Project

Member

Tag

---

# 13. Dialog

New Task

入力項目

- Title
- Date
- Time
- Project
- Priority
- Assignee

保存後

Toast表示。

---

# 14. Empty State

予定が存在しない場合

表示

- Calendar Icon
- メッセージ
- Create Task Button

例

```text
No events scheduled.

Enjoy your free day.
```

---

# 15. Loading

Skeleton表示

対象

- Calendar
- Agenda
- Toolbar

---

# 16. Toast

成功

```text
Task scheduled successfully.
```

更新

```text
Schedule updated.
```

削除

```text
Task removed.
```

失敗

```text
Failed to load calendar.
```

---

# 17. アニメーション

## 初回表示

GSAP

順番

Header

↓

Toolbar

↓

Calendar

↓

Agenda

Fade + Stagger

---

## 月切り替え

Cross Fade

または

Slide Animation

---

## Hover

Calendar Cell

背景色変更

Event Card

- translateY(-2px)
- Shadow強化

---

## Dialog

Fade

Scale

---

## Today

今日の日付

Pulse Animation（控えめ）

---

# 18. レスポンシブ

Desktop

左

Calendar

右

Agenda

---

Tablet

Agendaを下部へ移動

---

Mobile

AgendaをDrawer表示

Month Viewを優先

SidebarはDrawerへ変更する。

Bottom Navigationを表示する。

---

# 19. アクセシビリティ

- キーボード操作対応
- Focus Ring表示
- aria-label設定
- スクリーンリーダー対応
- カレンダーセルをTab移動可能とする

---

# 20. 使用Hooks

```text
useCalendar()

useCalendarEvents()

useAgenda()

useCalendarFilter()
```

---

# 21. 使用Feature

```text
features/calendar

features/task

features/project
```

---

# 22. 使用予定コンポーネント

```text
CalendarHeader

CalendarGrid

CalendarCell

EventCard

AgendaPanel

MiniCalendar

TaskBadge

PriorityBadge

AvatarGroup

SearchInput

FilterDropdown

Dialog

Toast

Skeleton

EmptyState
```

---

# 23. 将来追加予定

- ドラッグ&ドロップによる日程変更
- 繰り返しタスク
- タイムゾーン対応
- 外部カレンダー連携（Google / Outlook）
- 祝日表示
- AIによるスケジュール提案
- カレンダー共有
- 印刷用ビュー
