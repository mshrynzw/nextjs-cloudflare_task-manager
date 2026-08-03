# Component Design

Version 1.0

---

# 1. Purpose

本ドキュメントはTask Managerで利用する共通コンポーネントを定義する。

目的

- UIの統一
- コンポーネントの再利用
- Cursorによる品質の高い実装
- 保守性の向上

詳細仕様は

```text
docs/component-design/
```

配下に定義する。

---

# 2. Design Policy

全コンポーネントは以下を満たすこと。

- shadcn/uiベース
- Tailwind CSS
- TypeScript
- Feature First
- Composition優先
- Atomic Designは採用しない

---

# 3. Component Categories

## Layout

- Sidebar
- Header
- PageContainer
- PageHeader
- ContentArea

---

## Navigation

- Breadcrumb
- Pagination
- Tabs
- Drawer
- Command Palette

---

## Form

- Button
- Input
- PasswordInput
- Textarea
- Checkbox
- Radio
- Switch
- Select
- Date Picker

---

## Feedback

- Dialog
- Toast
- Tooltip
- Popover
- Alert
- Skeleton

---

## Data Display

- Badge
- Avatar
- AvatarGroup
- ProgressBar
- StatCard
- Card

---

## Project

- ProjectCard
- ProjectHeader
- ProjectToolbar

---

## Task

- TaskCard
- TaskRow
- TaskHeader
- Checklist
- ChecklistItem

---

## Dashboard

- KPI Card
- RecentActivity
- QuickActionCard

---

## Analytics

- LineChartCard
- BarChartCard
- PieChartCard
- HeatmapCard

---

## Calendar

- CalendarGrid
- CalendarCell
- EventCard
- AgendaPanel

---

## Profile

- UserCard
- SkillsCard
- SocialLinks

---

# 4. Component Rules

すべてのコンポーネントは

必ず

- Props定義
- State定義
- Loading
- Error
- Empty
- Accessibility

を持つこと。

---

# 5. Component States

全コンポーネントで共通。

Button

- Default
- Hover
- Active
- Focus
- Disabled
- Loading

Input

- Default
- Focus
- Error
- Success
- Disabled

Card

- Default
- Hover
- Selected

Dialog

- Open
- Close

Dropdown

- Open
- Close

---

# 6. Naming Rules

Component

```text
PascalCase
```

Hooks

```text
camelCase

useXXX()
```

Props

```text
camelCase
```

Types

```text
PascalCase
```

---

# 7. Folder Structure

```text
components/

ui/

layout/

navigation/

feedback/

forms/

charts/

features/
```

Feature専用Componentは

```text
features/**/components
```

へ配置する。

---

# 8. Reuse Policy

新しいコンポーネントを作る前に

既存コンポーネントを利用する。

禁止

- 同じ役割のButton
- 同じCard
- 同じInput

---

# 9. Cursor Rules

Cursorは

新しいComponentを作る前に

必ず

```text
components/

features/**/components
```

を検索すること。

存在する場合

それを利用する。

存在しない場合のみ

新規作成する。

---

# 10. Component List

共通

- Button
- Card
- Input
- Select
- Dialog
- Badge
- Avatar
- ProgressBar
- Skeleton
- Toast
- Tooltip
- Popover

画面専用

- ProjectCard
- TaskCard
- UserCard
- KPI Card
- EventCard
- ActivityTimeline

---

# 11. Future Documents

以下に詳細仕様を定義する。

```text
docs/component-design/

README.md

button.md

input.md

card.md

dialog.md

sidebar.md

header.md

project-card.md

task-card.md

stat-card.md

activity-timeline.md

avatar-group.md

badge.md

progress-bar.md

calendar-grid.md

event-card.md
```
