# Roadmap

Version: 1.0

---

# 1. Overview

本ドキュメントは、Task Managerの開発ロードマップを定義する。

Roadmapでは、単純な実装順ではなく、

- 開発基盤
- Database
- Authentication
- Backend
- Core Features
- UI / UX
- Testing
- Performance
- Security
- Deployment

の順序を考慮して開発を進める。

---

# 2. Roadmap Principles

以下を基本方針とする。

- 小さな単位で完成させる
- 設計と実装を同期させる
- Feature単位でテストする
- 動作する状態を維持しながら開発する
- 大規模な変更を一度に行わない
- UIとBackendを可能な限り独立して開発する
- Performanceを後付けにしない
- Securityを最後にまとめて実装しない

---

# 3. Development Phases

全体を以下のPhaseに分割する。

```text
Phase 0  Project Foundation
    ↓
Phase 1  Development Environment
    ↓
Phase 2  Database Foundation
    ↓
Phase 3  Authentication
    ↓
Phase 4  Backend / API
    ↓
Phase 5  Core Project Management
    ↓
Phase 6  Task Management
    ↓
Phase 7  Supporting Features
    ↓
Phase 8  UI / UX Polish
    ↓
Phase 9  Testing
    ↓
Phase 10 Performance / Security
    ↓
Phase 11 Deployment
    ↓
Phase 12 Portfolio Release
```

---

# 4. Status Definition

Statusは以下の4種類を使用する。

| Status        | Meaning          |
| ------------- | ---------------- |
| `PLANNED`     | 未着手           |
| `IN PROGRESS` | 作業中           |
| `DONE`        | 完了             |
| `BLOCKED`     | 他作業の完了待ち |

---

# 5. Priority Definition

Priorityは以下の3段階とする。

| Priority | Meaning  |
| -------- | -------- |
| P0       | 必須     |
| P1       | 重要     |
| P2       | 将来対応 |

---

# 6. Phase 0 — Project Foundation

## Goal

プロジェクトの基本方針と設計を確定する。

## Status

`DONE`

## Tasks

- [x] Project concept決定
- [x] Requirements作成
- [x] Basic Design作成
- [x] Detail Design作成
- [x] Product Design作成
- [x] Architecture Design作成
- [x] Database Design作成
- [x] API Design作成
- [x] UI Guideline作成
- [x] Component Design作成
- [x] Development Log作成
- [x] Roadmap作成

---

# 7. Phase 1 — Development Environment

## Goal

ローカル開発環境と開発ルールを完成させる。

## Status

`DONE`

## Tasks

### Project

- [x] Next.js project creation
- [x] TypeScript
- [x] Tailwind CSS
- [x] ESLint
- [x] Base UI / shadcn
- [x] Lucide
- [x] TanStack Query
- [x] React Hook Form
- [x] Zod

### Development Rules

- [x] AGENTS.md
- [x] Cursor Rules
- [x] VS Code settings
- [x] Test directory
- [x] Environment variable strategy
- [x] Git workflow

### Testing

- [x] Test runner configuration
- [x] Unit test configuration
- [x] Integration test configuration
- [x] E2E test configuration

---

# 8. Phase 2 — Database Foundation

## Goal

Cloudflare D1 + Drizzleを利用したDatabase基盤を構築する。

## Status

`DONE`

## Tasks

### Cloudflare

- [x] Cloudflare account configuration
- [x] D1 database creation (`task-manager-dev`)
- [x] Local D1 configuration
- [x] Development database
- [ ] Production database (`task-manager-prod` — create at deployment)

### Drizzle

- [x] Install Drizzle ORM
- [x] Configure Drizzle
- [x] Create schema
- [x] Configure migrations
- [x] Configure seed

### Schema

- [x] Users
- [x] Workspaces
- [x] Workspace Members
- [x] Projects
- [x] Project Members
- [x] Tasks
- [x] Checklist Items
- [x] Tags
- [x] Project Tags
- [x] Task Tags
- [x] Comments
- [x] Activities
- [x] Notifications
- [x] User Settings

### Tests

- [x] Database connection test
- [x] Migration test
- [x] CRUD test
- [x] Foreign Key test
- [x] Authorization data test

---

# 9. Phase 3 — Authentication

## Goal

安全なAuthentication / Authorizationを実装する。

## Status

`DONE`

## Authentication

実装順: GitHub → Google → Email

- [x] Auth.js setup
- [x] Session management
- [x] GitHub authentication
- [x] Google authentication
- [x] Email authentication
- [x] Logout
- [x] Session expiration

## Authorization

- [x] Workspace membership
- [x] Project membership
- [x] Role management
- [x] Permission checks
- [x] Protected routes

## Roles

```text
owner
member
viewer
```

---

# 10. Phase 4 — Backend / API

## Goal

ApplicationのBackend Layerを完成させる。

## Status

`DONE`

## Priority

`P0`

## Architecture

```text
Route Handler
    ↓
Validation
    ↓
Service
    ↓
Repository
    ↓
Drizzle
    ↓
D1 / SQLite
```

## API

### Users

- [x] GET user
- [x] UPDATE user

### Projects

- [x] GET projects
- [x] GET project
- [x] POST project
- [x] PATCH project
- [x] DELETE / archive project

### Tasks

- [x] GET tasks
- [x] GET task
- [x] POST task
- [x] PATCH task
- [x] DELETE / archive task
- [x] Update status
- [x] Update position
- [x] Assign user

### Comments

- [x] GET comments
- [x] POST comment
- [x] PATCH comment
- [x] DELETE comment

### Checklist

- [x] GET checklist
- [x] POST checklist item
- [x] PATCH checklist item
- [x] DELETE checklist item

### Notifications

- [x] GET notifications
- [x] Mark as read
- [x] Mark all as read

---

# 11. Phase 5 — Core Project Management

## Goal

Project Managementのコア機能を完成させる。

## Status

`DONE`

## Priority

`P0`

---

## 11.1 Project List

- [x] Project List
- [x] Search
- [x] Filter
- [x] Sort
- [x] Status filter
- [x] Priority filter
- [x] Create Project
- [x] Archive Project
- [x] Project Card
- [x] Progress display

---

## 11.2 Project Detail

- [x] Project information
- [x] Project description
- [x] Project members
- [x] Task overview
- [x] Progress
- [x] Activity
- [ ] Project settings

> Activity は Empty State を配置。詳細タイムラインは Activity データ連携後に拡張する。
> Project settings（編集フォーム）は Archive メニューを先行実装。フル設定 UI は後続で拡張する。

---

## 11.3 Project Progress

ProgressはTaskから算出する。

```text
Completed Tasks
÷
Total Tasks
× 100
```

DatabaseへProgressを重複保存しない。

---

# 12. Phase 6 — Task Management

## Goal

Task Managementの主要機能を完成させる。

## Status

`DONE`

## Priority

`P0`

---

# 12.1 Task Board

- [x] Kanban Board
- [x] Drag & Drop
- [x] Task creation
- [x] Task editing
- [x] Status change
- [x] Priority change
- [x] Assignee change
- [x] Position update
- [x] Optimistic update
- [x] Error recovery

Columns

```text
Backlog
Todo
In Progress
Review
Done
```

---

# 12.2 Task Detail

- [x] Task title
- [x] Description
- [x] Status
- [x] Priority
- [x] Assignee
- [x] Due date
- [ ] Tags
- [x] Checklist
- [x] Comments
- [ ] Attachments
- [x] Activity history

> Tags / Attachments は未実装。Activity は Empty State を配置（詳細タイムラインは後続）。

---

# 12.3 Task Search

- [x] Search by title
- [x] Search by description
- [ ] Search by tag
- [ ] Filter by status
- [x] Filter by priority
- [ ] Filter by assignee
- [ ] Filter by due date

> Board 上の検索・Priority フィルタを実装。Status はカラム分割で表現。Tag / Assignee / Due date フィルタは後続。

---

# 13. Phase 7 — Supporting Features

## Goal

Project / Task Managementを補完する機能を実装する。

## Status

`PLANNED`

## Priority

`P1`

---

# 13.1 Calendar

- [ ] Monthly Calendar
- [ ] Weekly Calendar
- [ ] Task display
- [ ] Due date display
- [ ] Event interaction
- [ ] Task navigation

---

# 13.2 Dashboard

- [ ] Today's Tasks
- [ ] Completed Tasks
- [ ] Completion Rate
- [ ] Upcoming Tasks
- [ ] Overdue Tasks
- [ ] Project Progress
- [ ] Recent Activity
- [ ] Mini Calendar
- [ ] Quick Actions

---

# 13.3 Analytics

- [ ] Completion Rate
- [ ] Completed Tasks
- [ ] Overdue Tasks
- [ ] Project Progress
- [ ] Completion Trend
- [ ] Workload
- [ ] Charts

Analyticsは初期段階では既存データから算出する。

---

# 13.4 Notifications

- [ ] Notification list
- [ ] Unread state
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Task assignment
- [ ] Mention
- [ ] Comment
- [ ] Due date notification

---

# 14. Phase 8 — Settings / Profile

## Goal

ユーザーおよびWorkspaceの設定機能を完成させる。

## Status

`PLANNED`

## Priority

`P1`

---

# 14.1 Profile

- [ ] Display name
- [ ] Username
- [ ] Avatar
- [ ] Bio
- [ ] Job title
- [ ] Website
- [ ] Activity
- [ ] Statistics

---

# 14.2 Settings

### Account

- [ ] Profile settings
- [ ] Email
- [ ] Password / Authentication

### Appearance

- [ ] Theme
- [ ] Accent color
- [ ] UI density
- [ ] Animation settings

### Notifications

- [ ] Email notifications
- [ ] In-app notifications
- [ ] Task notifications
- [ ] Mention notifications
- [ ] Due date notifications

### Workspace

- [ ] Workspace information
- [ ] Members
- [ ] Roles
- [ ] Permissions

---

# 15. Phase 9 — UI / UX Polish

## Goal

ポートフォリオとして高いVisual Qualityを実現する。

## Status

`PLANNED`

## Priority

`P0`

---

# 15.1 Design System

- [ ] Design Tokens
- [ ] Colors
- [ ] Typography
- [ ] Spacing
- [ ] Radius
- [ ] Shadows
- [ ] Motion

`docs/08_ui-guideline.md` に準拠する。

---

# 15.2 Components

共通Componentを整理する。

- [ ] Button
- [ ] Input
- [ ] Select
- [ ] Dialog
- [ ] Dropdown
- [ ] Tooltip
- [ ] Popover
- [ ] Toast
- [ ] Command Palette
- [ ] Card
- [ ] Badge
- [ ] Avatar
- [ ] Skeleton

---

# 15.3 Animation

GSAPを利用して以下を実装する。

- [ ] Initial Load
- [ ] Page Transition
- [ ] Modal
- [ ] Sidebar
- [ ] Card Hover
- [ ] Button Interaction
- [ ] List Animation
- [ ] Loading

過度なAnimationは禁止する。

---

# 15.4 Responsive

### Desktop

- [ ] Sidebar
- [ ] Multi-column layout
- [ ] Dense information

### Tablet

- [ ] Adaptive layout
- [ ] Sidebar optimization

### Mobile

- [ ] Mobile navigation
- [ ] Single-column layout
- [ ] Bottom navigation / Drawer
- [ ] Touch interaction
- [ ] Mobile Kanban

---

# 16. Phase 10 — Loading / Error / Empty States

## Goal

すべての主要画面で状態変化を適切に表示する。

## Status

`PLANNED`

## Priority

`P0`

---

## Loading

- [ ] Page Skeleton
- [ ] Card Skeleton
- [ ] Table Skeleton
- [ ] Task Skeleton
- [ ] Button Loading

---

## Empty

- [ ] Empty Project
- [ ] Empty Task
- [ ] Empty Notification
- [ ] Empty Activity
- [ ] Empty Search Result

---

## Error

- [ ] API Error
- [ ] Database Error
- [ ] Authentication Error
- [ ] Permission Error
- [ ] Network Error

---

## Recovery

- [ ] Retry
- [ ] Refresh
- [ ] Back Navigation

---

# 17. Phase 11 — Testing

## Goal

主要機能が安定して動作する状態にする。

## Status

`PLANNED`

## Priority

`P0`

---

# 17.1 Unit Tests

対象

- [ ] Utility
- [ ] Validation
- [ ] Service
- [ ] Repository
- [ ] Business Logic

---

# 17.2 Integration Tests

対象

- [ ] API
- [ ] Database
- [ ] Authentication
- [ ] Authorization
- [ ] Project
- [ ] Task

---

# 17.3 E2E Tests

主要User Flow

```text
Login
 ↓
Dashboard
 ↓
Create Project
 ↓
Create Task
 ↓
Move Task
 ↓
Task Detail
 ↓
Complete Task
 ↓
Logout
```

---

# 17.4 Test Directory

すべてのテストはプロジェクト直下の

```text
tests/
```

に配置する。

```text
tests/
├── unit/
├── integration/
└── e2e/
```

---

# 18. Phase 12 — Security

## Goal

Productionで安全に運用できる状態にする。

## Status

`PLANNED`

## Priority

`P0`

## Tasks

- [ ] Authentication review
- [ ] Authorization review
- [ ] Input validation
- [ ] XSS protection
- [ ] SQL injection protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Secure headers
- [ ] Session security
- [ ] Secret management
- [ ] Environment variable review

---

# 19. Phase 13 — Performance

## Goal

初回アクセスと主要操作を高速化する。

## Status

`PLANNED`

## Priority

`P0`

---

# 19.1 Initial Load

- [ ] Server Components optimization
- [ ] Client Component reduction
- [ ] JavaScript bundle analysis
- [ ] Image optimization
- [ ] Font optimization
- [ ] Cache strategy

---

# 19.2 Database

- [ ] Query optimization
- [ ] Index review
- [ ] N+1 prevention
- [ ] Pagination
- [ ] SELECT field optimization

---

# 19.3 API

- [ ] Response size optimization
- [ ] Caching
- [ ] Error handling
- [ ] Rate limiting

---

# 19.4 Performance Targets

目標値

| Metric            |         Target |
| ----------------- | -------------: |
| Initial Page Load |           Fast |
| LCP               |         < 2.5s |
| INP               |        < 200ms |
| CLS               |          < 0.1 |
| API Response      | < 500ms target |

実際のProduction環境では計測結果を基準に改善する。

---

# 20. Phase 14 — Accessibility

## Goal

Keyboard / Screen Reader / Reduced Motionなどを考慮したUIを実現する。

## Status

`PLANNED`

## Tasks

- [ ] Semantic HTML
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Focus visible
- [ ] ARIA labels
- [ ] Color contrast
- [ ] Form accessibility
- [ ] Dialog accessibility
- [ ] Command Palette accessibility
- [ ] Reduced motion

---

# 21. Phase 15 — CI/CD

## Goal

GitHubへのPush / Pull Requestから自動的に品質チェックを行えるようにする。

## Status

`PLANNED`

## Tasks

- [ ] GitHub Actions
- [ ] Lint
- [ ] Type Check
- [ ] Unit Test
- [ ] Integration Test
- [ ] E2E Test
- [ ] Build
- [ ] Deployment

---

# 22. CI Pipeline

```text
Pull Request
     ↓
Install
     ↓
Lint
     ↓
Type Check
     ↓
Unit Test
     ↓
Integration Test
     ↓
Build
     ↓
E2E
```

すべて成功した場合のみMerge可能とすることを目標とする。

---

# 23. Phase 16 — Deployment

## Goal

Production環境へDeployする。

## Status

`PLANNED`

## Priority

`P0`

---

## Infrastructure

- [ ] Cloudflare account
- [ ] D1
- [ ] Application hosting
- [ ] Environment variables
- [ ] Production database
- [ ] Domain
- [ ] HTTPS
- [ ] Security configuration

---

# 24. Production Environment

環境を以下に分離する。

```text
Development
     ↓
Preview / Staging
     ↓
Production
```

Production Databaseへ開発用Seed Dataを投入しない。

---

# 25. Phase 17 — Demo / Portfolio Preparation

## Goal

案件獲得用ポートフォリオとして公開できる状態にする。

## Status

`PLANNED`

## Priority

`P0`

---

# 25.1 Demo Data

Demo環境には適切なデータを用意する。

目安

```text
Projects
8〜12

Tasks
50〜100

Members
5〜10

Comments
30〜50

Activities
100+
```

---

# 25.2 Demo Account

必要に応じてDemo Accountを用意する。

```text
Demo User
    ↓
Demo Workspace
    ↓
Demo Projects
    ↓
Demo Tasks
```

---

# 25.3 Portfolio Page

ポートフォリオサイトから以下へ誘導できるようにする。

```text
Portfolio
   ↓
Project Overview
   ↓
Live Demo
   ↓
GitHub
   ↓
Technical Documentation
```

---

# 26. README Preparation

READMEには以下を記載する。

- Product Overview
- Features
- Screenshots
- Tech Stack
- Architecture
- Database
- Testing
- Deployment
- Performance
- Design Decisions
- Live Demo

---

# 27. Documentation Review

公開前に以下を確認する。

```text
docs/
├── 01_requirements.md
├── 02_basic-design.md
├── `03_detail-design/*.md`
├── 04_architecture.md
├── 05_database.md
├── 06_api.md
├── 07_component_design.md
├── 08_ui-guideline.md
├── development-log.md
├── product.md
├── roadmap.md
└── screen-list.md
```

すべてのドキュメントと実装内容が一致していることを確認する。

---

# 28. Final Quality Gate

Production公開前に以下を確認する。

## Functional

- [ ] Login
- [ ] Dashboard
- [ ] Project
- [ ] Task
- [ ] Kanban
- [ ] Calendar
- [ ] Analytics
- [ ] Settings
- [ ] Profile

---

## Visual

- [ ] Design Token consistency
- [ ] Typography
- [ ] Spacing
- [ ] Responsive
- [ ] Animation
- [ ] Loading
- [ ] Empty State
- [ ] Error State

---

## Engineering

- [ ] Type Check
- [ ] ESLint
- [ ] Unit Test
- [ ] Integration Test
- [ ] E2E Test
- [ ] Build

---

## Security

- [ ] Authentication
- [ ] Authorization
- [ ] Validation
- [ ] Secrets
- [ ] Headers
- [ ] Rate Limit

---

## Performance

- [ ] Initial Load
- [ ] LCP
- [ ] INP
- [ ] CLS
- [ ] API Response
- [ ] Database Query

---

# 29. Portfolio Quality Gate

案件獲得用ポートフォリオとして、以下を満たすことを目標とする。

### 5 Second Test

初めてアクセスした人が5秒以内に、

> 「ちゃんとしたSaaSだ」

と感じられる。

---

### 30 Second Test

30秒程度操作した人が、

> 「UIだけでなく、機能もしっかり作られている」

と感じられる。

---

### 3 Minute Test

RepositoryやDocumentationを確認した人が、

> 「設計・DB・API・テストまで考えて作っている」

と判断できる。

---

# 30. Release Milestones

## Milestone 1 — Foundation

```text
Requirements
Basic Design
Architecture
Database Design
API Design
UI Guideline
Component Design
```

Status:

`DONE`

---

## Milestone 2 — Infrastructure

```text
Next.js
Cloudflare
D1
Drizzle
Auth.js
Testing
```

Status:

`PLANNED`

---

## Milestone 3 — Core MVP

```text
Login
Dashboard
Projects
Tasks
Kanban
Task Detail
```

Status:

`PLANNED`

---

## Milestone 4 — Product Complete

```text
Calendar
Analytics
Settings
Profile
Notifications
```

Status:

`PLANNED`

---

## Milestone 5 — Production Ready

```text
Testing
Security
Performance
Accessibility
CI/CD
Deployment
```

Status:

`PLANNED`

---

## Milestone 6 — Portfolio Ready

```text
Demo Data
README
Live Demo
Portfolio Integration
Technical Documentation
```

Status:

`PLANNED`

---

# 31. Future Features

MVP完成後に検討する。

## P1

- [ ] Task Dependencies
- [ ] Recurring Tasks
- [ ] Time Tracking
- [ ] File Attachments
- [ ] Workspace Invitations
- [ ] Advanced Search
- [ ] Saved Views

## P2

- [ ] AI Task Summary
- [ ] AI Project Summary
- [ ] Automation
- [ ] Webhooks
- [ ] Integrations
- [ ] Custom Fields
- [ ] Real-time Collaboration
- [ ] PWA
- [ ] Offline Support

---

# 32. Features Explicitly Deferred

初期Versionでは以下を実装しない。

```text
Chat
Payment
Native Mobile App
Enterprise SSO
Advanced Automation
Real-time Collaboration
```

これらはMVP完成後に再評価する。

---

# 33. Roadmap Change Policy

Roadmapは固定された計画ではない。

以下の場合はRoadmapを変更する。

- 技術的制約が判明した
- Requirementsが変更された
- Performance問題が発生した
- Security上の問題が発生した
- Featureの優先順位が変わった
- Cloudflare / Next.jsなどの仕様変更が発生した

変更した場合は`development-log.md`に理由を記録する。

---

# 34. Cursor Development Rule

CursorがFeatureを実装する場合、Roadmapを確認する。

実装対象がRoadmapに存在しない場合は、勝手にScopeを拡張しない。

必要な場合は、

```text
1. Roadmapを更新
2. Requirementsを確認
3. Designを確認
4. Implementation
5. Test
6. Development Log更新
```

の順序で進める。

---

# 35. Definition of Done

Roadmap上のTaskを`DONE`にする条件。

- 実装完了
- TypeScript Errorなし
- ESLint Errorなし
- 必要なUnit Test完了
- 必要なIntegration Test完了
- 必要なE2E Test完了
- Responsive対応完了
- Loading State対応
- Empty State対応
- Error State対応
- Accessibility確認
- Security確認
- Documentation更新
- Development Log更新

---

# 36. Current Progress

## Completed

```text
Requirements
████████████████████ 100%

Basic Design
████████████████████ 100%

Detail Design
████████████████████ 100%

Product Design
████████████████████ 100%

Architecture
████████████████████ 100%

Database Design
████████████████████ 100%

API Design
████████████████████ 100%

UI Guideline
████████████████████ 100%

Component Design
████████████████████ 100%

Development Log
████████████████████ 100%

Roadmap
████████████████████ 100%
```

---

## In Progress

```text
Development Environment
██████████░░░░░░░░░░ 50%
```

---

## Planned

```text
Database Implementation
Authentication
API Implementation
Core Features
UI Implementation
Testing
Security
Performance
CI/CD
Deployment
Portfolio Release
```

---

# 37. Recommended Development Order

今後の実装は以下の順序を基本とする。

```text
1. Development Environment
        ↓
2. Cloudflare D1
        ↓
3. Drizzle
        ↓
4. Database Schema
        ↓
5. Migration / Seed
        ↓
6. Database Tests
        ↓
7. Auth.js
        ↓
8. Authentication Tests
        ↓
9. API Foundation
        ↓
10. Project API
        ↓
11. Task API
        ↓
12. Login
        ↓
13. Dashboard
        ↓
14. Project List
        ↓
15. Project Detail
        ↓
16. Task Board
        ↓
17. Task Detail
        ↓
18. Calendar
        ↓
19. Analytics
        ↓
20. Settings
        ↓
21. Profile
        ↓
22. UI Polish
        ↓
23. Unit / Integration / E2E
        ↓
24. Security Review
        ↓
25. Performance Optimization
        ↓
26. CI/CD
        ↓
27. Production Deployment
        ↓
28. Portfolio Integration
```

---

# 38. Final Goal

Task Managerの最終目標は、

> 「見た目がきれいなTodoアプリ」

ではない。

以下をすべて兼ね備えたWeb Applicationを完成させる。

```text
Beautiful UI
      +
Excellent UX
      +
Solid Architecture
      +
Well Designed Database
      +
Type-safe API
      +
Authentication
      +
Authorization
      +
Automated Testing
      +
Performance
      +
Security
      +
Documentation
```

最終的に、実際の案件で開発するWeb Applicationと同等の考え方で制作された、案件獲得用ポートフォリオとして完成させる。
