# Screen List

Version: 1.0

---

# 1. Overview

本ドキュメントは、Task Managerにおける画面一覧と各画面の責務を定義する。

画面ごとの詳細なUI仕様・インタラクション・状態については、`docs/03_detail-design/` 配下の各画面設計書を参照する。

本ドキュメントでは、以下を管理する。

- Screen ID
- Screen Name
- Route
- Authentication Requirement
- Purpose
- Main Features
- Primary Components
- Responsive Behavior
- Loading / Empty / Error State
- Related Documents

---

# 2. Screen Architecture

Task Managerの画面構成は以下とする。

```text
Task Manager
│
├── Authentication
│   └── Login
│
└── Application
    │
    ├── Dashboard
    │
    ├── Projects
    │   ├── Project List
    │   └── Project Detail
    │       └── Task Board
    │
    ├── Tasks
    │   └── Task Detail
    │
    ├── Calendar
    │
    ├── Analytics
    │
    ├── Settings
    │
    └── Profile
```

---

# 3. Screen Summary

| ID      | Screen         | Route                         | Auth | Priority | Status  |
| ------- | -------------- | ----------------------------- | ---- | -------- | ------- |
| SCR-001 | Login          | `/login`                      | No   | P0       | Done    |
| SCR-002 | Dashboard      | `/dashboard`                  | Yes  | P0       | In Progress |
| SCR-003 | Project List   | `/projects`                   | Yes  | P0       | Planned |
| SCR-004 | Project Detail | `/projects/[projectId]`       | Yes  | P0       | Planned |
| SCR-005 | Task Board     | `/projects/[projectId]/board` | Yes  | P0       | Done |
| SCR-006 | Task Detail    | `/projects/[projectId]/tasks/[taskId]` | Yes  | P0       | Done |
| SCR-007 | Calendar       | `/calendar`                   | Yes  | P1       | Planned |
| SCR-008 | Analytics      | `/analytics`                  | Yes  | P1       | Planned |
| SCR-009 | Settings       | `/settings`                   | Yes  | P1       | Planned |
| SCR-010 | Profile        | `/profile`                    | Yes  | P1       | Planned |
| SCR-011 | Mobile Layout  | Responsive UI                 | Yes  | P0       | Planned |

---

# 4. Screen ID Convention

Screen IDは以下の形式とする。

```text
SCR-XXX
```

例

```text
SCR-001
SCR-002
SCR-003
```

画面を新規追加する場合は既存IDを変更せず、新しいIDを採番する。

---

# 5. Authentication

## SCR-001 — Login

### Route

```text
/login
```

### Authentication

不要。

### Purpose

ユーザーがTask Managerへログインするための画面。

### Main Features

- Email Login
- Password Login
- Social Login
- Remember Session
- Forgot Password
- Sign Up
- Demo Account

### Primary UI

- Logo
- Login Form
- Email Input
- Password Input
- Login Button
- Social Login Button
- Password Reset Link
- Sign Up Link

### States

```text
Default
Loading
Validation Error
Authentication Error
Success
```

### UX Requirements

- 初回表示を高速にする
- Login UI表示だけのためにDatabaseへ不要な接続を行わない
- Password入力を安全に扱う
- Authentication Errorを分かりやすく表示する
- Keyboard操作に対応する

### Responsive

Desktop / Tablet / Mobileに対応する。

### Related Design

```text
docs/03_detail-design/login.md
```

---

# 6. Dashboard

## SCR-002 — Dashboard

### Route

```text
/dashboard
```

### Authentication

Required.

### Purpose

ユーザーがログイン後に最初に確認するOverview画面。

ユーザーが、

> 「今日何をすべきか」

を短時間で把握できることを目的とする。

### Main Features

- Today's Tasks
- Upcoming Tasks
- Overdue Tasks
- Project Progress
- Completion Rate
- Recent Activity
- Quick Actions
- Mini Calendar

### Primary UI

```text
Header
Sidebar
Welcome Area
Metric Cards
Today's Tasks
Project Progress
Recent Activity
Quick Actions
```

### States

```text
Loading
Loaded
Empty
Error
```

### Empty State

ProjectやTaskが存在しない場合、

```text
Create your first project
```

などのCTAを表示する。

### Responsive

Desktopでは複数Column。

MobileではSingle Columnへ変更する。

### Related Design

```text
docs/03_detail-design/dashboard.md
```

---

# 7. Project List

## SCR-003 — Project List

### Route

```text
/projects
```

### Authentication

Required.

### Purpose

ユーザーが所属するProjectを一覧表示する。

### Main Features

- Project List
- Project Card
- Search
- Filter
- Sort
- Tag
- Progress
- Deadline
- Members
- Create Project
- Archive Project

### Primary UI

```text
Page Header
Search
Filter
Sort
Project Grid
Project Card
Create Project Button
```

### Project Card

最低限以下を表示する。

```text
Project Name
Description
Color
Status
Progress
Deadline
Members
Tags
```

### States

```text
Loading
Loaded
Empty
Search Empty
Error
```

### Empty State

Projectが存在しない場合、

```text
No projects yet.

Create your first project.
```

を表示する。

### Responsive

Desktop:

```text
3〜4 Column
```

Tablet:

```text
2 Column
```

Mobile:

```text
1 Column
```

### Related Design

```text
docs/03_detail-design/project-list.md
```

---

# 8. Project Detail

## SCR-004 — Project Detail

### Route

```text
/projects/[projectId]
```

### Authentication

Required.

### Purpose

特定Projectの概要・進捗・Task・Member・Activityを確認する。

### Main Features

- Project Information
- Project Progress
- Task Summary
- Members
- Recent Activity
- Project Settings
- Navigation to Task Board

### Primary UI

```text
Project Header
Project Description
Progress
Task Summary
Members
Activity
Project Navigation
```

### Project Navigation

```text
Overview
Board
Calendar
Analytics
```

### States

```text
Loading
Loaded
Not Found
Permission Denied
Error
```

### Related Design

```text
docs/03_detail-design/project-detail.md
```

---

# 9. Task Board

## SCR-005 — Task Board

### Route

```text
/projects/[projectId]/board
```

### Authentication

Required.

### Purpose

Project内のTaskをKanban形式で管理する。

### Main Features

- Kanban Board
- Drag & Drop
- Create Task
- Edit Task
- Change Status
- Change Priority
- Change Assignee
- Change Position
- Search
- Filter
- Sort

### Columns

```text
Backlog
Todo
In Progress
Review
Done
```

### Primary UI

```text
Project Header
Board Toolbar
Search
Filter
Kanban Columns
Task Cards
Create Task
```

### Interaction

TaskはDrag & DropによってColumn間を移動できる。

Position変更はOptimistic UIを利用する。

### States

```text
Loading
Loaded
Empty
Error
Drag Error
```

### Empty State

ColumnにTaskがない場合、

```text
No tasks
```

を表示する。

### Responsive

Desktopでは横方向のKanban Board。

Mobileでは、

- Horizontal Scroll
- Column Selector
- Compact Board

などを利用する。

### Related Design

```text
docs/03_detail-design/task-board.md
```

---

# 10. Task Detail

## SCR-006 — Task Detail

### Route

```text
/tasks/[taskId]
```

### Authentication

Required.

### Purpose

Taskの詳細情報と関連情報を管理する。

### Main Features

- Title
- Description
- Status
- Priority
- Assignee
- Due Date
- Tags
- Checklist
- Comments
- Attachments
- Activity

### Primary UI

```text
Task Header
Task Description
Properties
Checklist
Comments
Activity
```

### States

```text
Loading
Loaded
Not Found
Permission Denied
Error
```

### Interactions

- Status Change
- Priority Change
- Assignee Change
- Due Date Change
- Checklist Toggle
- Comment
- Edit
- Archive

### Related Design

```text
docs/03_detail-design/task-detail.md
```

---

# 11. Calendar

## SCR-007 — Calendar

### Route

```text
/calendar
```

### Authentication

Required.

### Purpose

TaskのDue DateをCalendar形式で確認する。

### Main Features

- Monthly View
- Weekly View
- Task Display
- Due Date
- Task Navigation
- Date Navigation
- Filter

### Primary UI

```text
Calendar Header
View Switcher
Date Navigation
Calendar Grid
Task Events
```

### States

```text
Loading
Loaded
Empty
Error
```

### Responsive

Desktop:

```text
Full Calendar
```

Mobile:

```text
Compact Calendar
Agenda / List
```

### Related Design

```text
docs/03_detail-design/calendar.md
```

---

# 12. Analytics

## SCR-008 — Analytics

### Route

```text
/analytics
```

### Authentication

Required.

### Purpose

ProjectおよびTaskの進捗状況を可視化する。

### Main Features

- Completion Rate
- Completed Tasks
- Overdue Tasks
- Project Progress
- Completion Trend
- Workload
- Time Tracking（将来）

### Primary UI

```text
Analytics Header
Date Range
Filter
Metric Cards
Charts
Project Performance
Task Performance
```

### States

```text
Loading
Loaded
Empty
Error
```

### UX Requirement

単にグラフを表示するのではなく、

> 「現在のProjectが順調なのか」

を判断できるUIとする。

### Related Design

```text
docs/03_detail-design/analytics.md
```

---

# 13. Settings

## SCR-009 — Settings

### Route

```text
/settings
```

### Authentication

Required.

### Purpose

ユーザーおよびWorkspaceの設定を管理する。

### Sections

```text
Account
Appearance
Notifications
Workspace
```

### Account

- Profile
- Email
- Authentication

### Appearance

- Theme
- Accent Color
- UI Density
- Animation

### Notifications

- Email Notifications
- In-App Notifications
- Task Notifications
- Mention Notifications
- Due Date Notifications

### Workspace

- Workspace Name
- Workspace Members
- Roles
- Permissions

### States

```text
Loading
Loaded
Saving
Saved
Validation Error
Error
```

### Related Design

```text
docs/03_detail-design/settings.md
```

---

# 14. Profile

## SCR-010 — Profile

### Route

```text
/profile
```

### Authentication

Required.

### Purpose

ユーザー自身のプロフィールおよびActivityを表示する。

### Main Features

- Avatar
- Name
- Username
- Job Title
- Bio
- Website
- Projects
- Completed Tasks
- Activity
- Statistics

### Primary UI

```text
Profile Header
Avatar
Profile Information
Statistics
Projects
Activity
```

### States

```text
Loading
Loaded
Error
```

### Related Design

```text
docs/03_detail-design/profile.md
```

---

# 15. Mobile Layout

## SCR-011 — Mobile Layout

### Type

Responsive Layout

### Route

すべてのApplication Screenに適用する。

### Purpose

Desktop UIを単純に縮小するのではなく、Mobileに適した操作体系を提供する。

### Main Features

- Mobile Navigation
- Bottom Navigation
- Drawer
- Responsive Header
- Touch Interaction
- Swipe
- Horizontal Scroll
- Mobile Kanban

### Primary Navigation

Mobileでは必要に応じて、

```text
Dashboard
Projects
Calendar
Analytics
Profile
```

をNavigationへ配置する。

### Sidebar

Desktop SidebarをMobileでは、

```text
Drawer
```

へ変更する。

### Responsive Rule

```text
Desktop
    ↓
Tablet
    ↓
Mobile
```

各BreakpointでLayoutを適切に変更する。

---

# 16. Global Layout

認証後のApplication Screenでは共通Layoutを使用する。

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
├────────────┬────────────────────────────────┤
│            │                                │
│ Sidebar    │ Main Content                   │
│            │                                │
│            │                                │
└────────────┴────────────────────────────────┘
```

---

# 17. Global Header

Headerには以下を配置する。

- Workspace Switcher
- Search
- Command Palette
- Notifications
- User Menu

---

# 18. Global Sidebar

SidebarにはPrimary Navigationを配置する。

```text
Dashboard
Projects
Calendar
Analytics
```

Secondary Navigation

```text
Settings
Profile
```

---

# 19. Command Palette

Global Command Paletteを提供する。

Shortcut

```text
⌘ K
Ctrl K
```

主要操作

```text
Search
Create Project
Create Task
Open Dashboard
Open Projects
Open Calendar
Open Analytics
Open Settings
Open Profile
Toggle Sidebar
```

---

# 20. Global UI States

すべての主要画面で以下の状態を考慮する。

```text
Default
Loading
Skeleton
Empty
Error
Permission Denied
Not Found
Success
```

---

# 21. Global Feedback

操作結果をユーザーへ適切に通知する。

### Toast

以下に使用する。

- Create Success
- Update Success
- Delete Success
- Save Success
- Error

---

### Dialog

以下に使用する。

- Delete Confirmation
- Archive Confirmation
- Create Project
- Create Task
- Edit Profile

---

### Tooltip

アイコンのみのButtonなどに使用する。

---

# 22. Navigation Rules

画面遷移は以下のルールに従う。

## Dashboard

```text
Dashboard
```

---

## Project

```text
Projects
 ↓
Project Detail
```

---

## Task

```text
Project
 ↓
Task Board
 ↓
Task Detail
```

---

## Calendar

```text
Calendar
 ↓
Task Detail
```

---

## Analytics

```text
Analytics
 ↓
Project Detail
```

---

# 23. Breadcrumb

必要な画面ではBreadcrumbを表示する。

例

```text
Projects
  /
Website Redesign
  /
Task Board
```

Mobileではスペースを考慮して簡略化する。

---

# 24. Modal Policy

Modalは以下のような短時間の操作に限定する。

- Create
- Edit
- Confirm
- Quick View

複雑な編集画面では専用ページまたはDrawerを使用する。

---

# 25. Drawer Policy

Mobileおよび補助情報の表示にDrawerを使用する。

例

- Task Detail
- Filters
- Navigation
- Project Information

---

# 26. Search / Filter / Sort

一覧系画面では以下を共通パターンとして使用する。

```text
Search
Filter
Sort
```

対象

- Projects
- Tasks
- Calendar
- Analytics

UIパターンを画面ごとに独自実装しない。

---

# 27. Responsive Breakpoints

Breakpointsは`docs/08_ui-guideline.md`で定義されたDesign Tokenを使用する。

画面ごとに独自Breakpointを設定しない。

---

# 28. Accessibility

全画面で以下を考慮する。

- Semantic HTML
- Keyboard Navigation
- Focus State
- Focus Trap
- Screen Reader
- ARIA
- Color Contrast
- Reduced Motion

---

# 29. Performance Requirements

各画面では不要なデータを初期ロードしない。

特にDashboard / Analyticsでは、

```text
必要なデータ
    ↓
必要なタイミング
    ↓
必要な量
```

だけ取得する。

---

# 30. Authentication Requirements

Login以外のApplication Screenは認証必須。

未認証ユーザーがアクセスした場合、

```text
Protected Screen
       ↓
Authentication Check
       ↓
Not Authenticated
       ↓
/login
```

へ遷移する。

---

# 31. Authorization Requirements

認証済みであっても、対象Resourceへの権限がない場合はアクセスできない。

```text
User
 ↓
Workspace Membership
 ↓
Project Membership
 ↓
Resource
```

の順で権限を確認する。

---

# 32. Error Routes

以下のError UIを用意する。

```text
404 Not Found
403 Permission Denied
500 Internal Error
Network Error
```

---

# 33. Screen-to-Data Mapping

| Screen         | Main Data                                              |
| -------------- | ------------------------------------------------------ |
| Login          | Session / User                                         |
| Dashboard      | Projects / Tasks / Activities / Notifications          |
| Project List   | Projects / Members / Tasks                             |
| Project Detail | Project / Members / Tasks / Activities                 |
| Task Board     | Tasks / Users / Tags                                   |
| Task Detail    | Task / Checklist / Comments / Attachments / Activities |
| Calendar       | Tasks / Projects                                       |
| Analytics      | Tasks / Projects / Activities / Time Entries           |
| Settings       | User / User Settings / Workspace                       |
| Profile        | User / Projects / Tasks / Activities                   |

---

# 34. Screen-to-API Mapping

| Screen         | Main API                         |
| -------------- | -------------------------------- |
| Login          | Auth API                         |
| Dashboard      | Dashboard / Projects / Tasks API |
| Project List   | Projects API                     |
| Project Detail | Project API                      |
| Task Board     | Tasks API                        |
| Task Detail    | Task / Comment / Checklist API   |
| Calendar       | Tasks API                        |
| Analytics      | Analytics API                    |
| Settings       | User / Settings API              |
| Profile        | User / Activity API              |

---

# 35. Screen-to-Test Mapping

| Screen         | Unit | Integration |         E2E |
| -------------- | ---: | ----------: | ----------: |
| Login          |  Yes |         Yes |         Yes |
| Dashboard      |  Yes |         Yes |         Yes |
| Project List   |  Yes |         Yes |         Yes |
| Project Detail |  Yes |         Yes |         Yes |
| Task Board     |  Yes |         Yes |         Yes |
| Task Detail    |  Yes |         Yes |         Yes |
| Calendar       |  Yes |         Yes | Recommended |
| Analytics      |  Yes |         Yes | Recommended |
| Settings       |  Yes |         Yes | Recommended |
| Profile        |  Yes |         Yes | Recommended |

---

# 36. Screen Implementation Order

実装順序は以下を基本とする。

```text
1. Login
      ↓
2. Dashboard
      ↓
3. Project List
      ↓
4. Project Detail
      ↓
5. Task Board
      ↓
6. Task Detail
      ↓
7. Calendar
      ↓
8. Analytics
      ↓
9. Settings
      ↓
10. Profile
      ↓
11. Mobile Optimization
```

ただし、Backend / Databaseの実装は画面実装より先に基盤を完成させる。

---

# 37. Design Reference Mapping

各画面のUI Referenceは以下のルールで管理する。

```text
ui-reference/
├── login/
├── dashboard/
├── project-list/
├── project-detail/
├── task-board/
├── task-detail/
├── calendar/
├── analytics/
├── settings/
├── profile/
└── mobile/
```

UI ReferenceはProduction実装の直接コピー元ではなく、Design Referenceとして扱う。

---

# 38. Detail Design Mapping

各画面の詳細仕様は以下で管理する。

```text
docs/03_detail-design/
├── login.md
├── dashboard.md
├── project-list.md
├── project-detail.md
├── task-board.md
├── task-detail.md
├── calendar.md
├── analytics.md
├── settings.md
└── profile.md
```

---

# 39. Screen Addition Rule

新しいScreenを追加する場合は、以下を更新する。

1. `screen-list.md`
2. Requirements
3. Basic Design
4. Detail Design
5. API Design
6. Component Design
7. UI Guideline
8. Roadmap
9. Development Log

必要に応じてArchitecture / Databaseも更新する。

---

# 40. Screen Removal Rule

Screenを削除する場合も、関連する設計書とRoadmapを更新する。

不要になったScreenの設計書を残す場合は、

```text
Status: Deprecated
```

と明記する。

---

# 41. Definition of Done

Screenを完成とする条件。

- [ ] UI実装完了
- [ ] Responsive対応
- [ ] Loading State
- [ ] Empty State
- [ ] Error State
- [ ] Permission State
- [ ] Accessibility
- [ ] Animation
- [ ] API Integration
- [ ] Validation
- [ ] Tests
- [ ] Documentation
- [ ] Design Guideline準拠

---

# 42. Portfolio Priority

案件獲得用ポートフォリオとして、以下の画面を特に高い完成度で実装する。

## Priority 1

```text
Login
Dashboard
Project List
Task Board
Analytics
```

## Priority 2

```text
Project Detail
Task Detail
Calendar
```

## Priority 3

```text
Settings
Profile
```

---

# 43. Five Second Experience

初めてアクセスしたユーザーが最初の5秒でプロダクトの品質を理解できるようにする。

特に以下を重視する。

```text
Login
 ↓
Dashboard
 ↓
Project List
 ↓
Task Board
```

---

# 44. Final Screen Principle

すべての画面は単独で美しくするだけではなく、Application全体として一貫した体験を提供する。

```text
Consistent Navigation
+
Consistent Components
+
Consistent Design Tokens
+
Consistent Interaction
+
Consistent Motion
=
Unified Product Experience
```

Task Managerの各Screenは、単なるページではなく、一つのProduct Experienceを構成する要素として設計する。
