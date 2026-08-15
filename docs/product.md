# Product Design

Version: 1.0

---

# 1. Product Overview

## Product Name

Task Manager

## Product Category

Productivity / Project Management SaaS

## Product Type

Web Application

---

# 2. Product Vision

Task Managerは、個人開発者、フリーランス、小規模チームが、プロジェクトとタスクをシンプルかつ直感的に管理するためのProject Management SaaSである。

単なるTodo管理ツールではなく、

- Project
- Task
- Team
- Calendar
- Analytics
- Activity

を一つの場所に集約する。

ユーザーが「次に何をすべきか」を迷わず把握できることを最も重要な価値とする。

---

# 3. Product Mission

> Make complex work feel simple.

複雑なプロジェクト管理を、シンプルで美しいUIによって整理する。

---

# 4. Product Philosophy

Task Managerでは以下の思想を重視する。

## Simple

必要な情報を必要なときだけ表示する。

## Fast

操作に対して即座に反応する。

## Focused

ユーザーがタスクそのものに集中できるUIを提供する。

## Elegant

業務ツールであっても、美しく心地よく使えるデザインを目指す。

## Predictable

どの画面でも同じルールで操作できる。

---

# 5. Target Users

## Primary Users

### Freelancer

案件を複数抱えるフリーランサー。

課題

- 案件ごとのタスク管理
- 納期管理
- 優先順位管理
- クライアント案件の進捗確認

---

### Small Team

2〜20人程度の小規模チーム。

課題

- 誰が何を担当しているか分からない
- タスクの進捗が把握しづらい
- プロジェクトが増えると管理が複雑になる

---

### Developer

ソフトウェア開発者。

課題

- Issue管理
- Sprint管理
- Bug管理
- Project Progress管理

---

### Web Production Team

Web制作会社・デザイン会社。

課題

- デザイン案件管理
- 開発タスク管理
- 納期管理
- チームメンバーへのタスク割り当て

---

# 6. Secondary Users

将来的には以下のユーザーも想定する。

- Startup
- Product Manager
- Designer
- Marketing Team
- Agency
- Content Creator

---

# 7. User Problems

Task Managerが解決する主な問題。

## Problem 1

タスクが複数の場所に分散している。

```text
Notes
Email
Chat
Spreadsheet
Calendar
```

これらを一つの場所へ集約する。

---

## Problem 2

プロジェクト全体の進捗が分からない。

Taskだけを見るのではなく、

```text
Project
 ↓
Progress
 ↓
Tasks
 ↓
Activity
```

という構造で把握できるようにする。

---

## Problem 3

今日やるべきことが分からない。

Dashboardで、

- Today's Tasks
- Upcoming Tasks
- Overdue Tasks
- Recent Activity

を確認できるようにする。

---

## Problem 4

タスクの状態を管理しづらい。

Kanban Boardによって、

```text
Backlog
Todo
In Progress
Review
Done
```

の状態を視覚的に管理する。

---

## Problem 5

プロジェクトの問題点に気づきにくい。

Analyticsによって、

- Completion Rate
- Overdue Tasks
- Workload
- Completion Trend

を確認できるようにする。

---

# 8. Product Value Proposition

Task Managerの価値は以下の3点。

### 1. Clarity

「何をすべきか」が明確になる。

### 2. Control

「プロジェクトがどこまで進んでいるか」を把握できる。

### 3. Momentum

「次に何をするか」をすぐに決められる。

---

# 9. Core User Journey

基本的なユーザーフロー。

```text
Login
  ↓
Dashboard
  ↓
Project
  ↓
Task Board
  ↓
Task Detail
  ↓
Complete Task
  ↓
Dashboard / Analytics
```

---

# 10. First-Time User Experience

初めてログインしたユーザーが、

> 「このアプリで何をすればいいのか分からない」

という状態にならないことを目標とする。

初回ログイン後は、

```text
Dashboard
 ↓
Create Project
 ↓
Create Task
```

という流れを自然に誘導する。

---

# 11. Dashboard Experience

Dashboardは単なる統計画面ではない。

ユーザーがアプリを開いた瞬間に、

> 「今日何をすればいいか」

を理解できる画面とする。

優先表示

1. Today's Tasks
2. Upcoming / Overdue
3. Project Progress
4. Recent Activity
5. Quick Actions

---

# 12. Project Experience

ProjectはTaskの単なる入れ物ではない。

ユーザーが、

- 目的
- 進捗
- メンバー
- タスク
- Activity

を把握できる単位として設計する。

---

# 13. Task Experience

Taskはアプリケーションの中心Entityとする。

Taskから、

- Status
- Priority
- Assignee
- Due Date
- Tags
- Checklist
- Comments
- Activity

を管理できる。

---

# 14. Kanban Experience

Task BoardではDrag & Dropを中心とした操作を提供する。

ユーザーはTaskを、

```text
Todo
 ↓
In Progress
 ↓
Review
 ↓
Done
```

と直感的に移動できる。

操作結果は即座にUIへ反映する。

---

# 15. Calendar Experience

CalendarはTaskの期限を時間軸で把握するために使用する。

ユーザーは、

- 月
- 週

単位でTaskを確認できる。

---

# 16. Analytics Experience

Analyticsは「数字を見るためだけの画面」にしない。

ユーザーが、

> 「プロジェクトは順調なのか？」

を判断できることを目的とする。

主要指標

- Completion Rate
- Completed Tasks
- Overdue Tasks
- Workload
- Completion Trend

---

# 17. Profile Experience

Profileではユーザー自身の活動を確認できる。

表示項目

- Profile
- Role
- Projects
- Completed Tasks
- Activity
- Statistics

---

# 18. Settings Experience

Settingsではアプリケーションの個人設定を管理する。

主要カテゴリ

- Account
- Appearance
- Notifications
- Workspace

---

# 19. Information Architecture

```text
Task Manager
│
├── Dashboard
│
├── Projects
│   ├── Project List
│   └── Project Detail
│       └── Task Board
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

# 20. Navigation Philosophy

Navigationはユーザーの作業を邪魔しない。

Primary Navigation

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

Project Context

```text
Project
 ├── Overview
 ├── Board
 ├── Calendar
 └── Analytics
```

---

# 21. Command Palette

Command Paletteを主要な操作方法の一つとして提供する。

目的

> 「マウスでUIを探す時間を減らす」

想定操作

```text
Create Project
Create Task
Search Project
Search Task
Open Calendar
Open Analytics
Open Settings
Toggle Sidebar
```

キーボードショートカット

```text
⌘ / Ctrl + K
```

---

# 22. Search

検索はProjectおよびTaskを対象とする。

検索対象

```text
Project Name
Project Description
Task Title
Task Description
Tags
```

将来的にGlobal Searchへ拡張する。

---

# 23. Notification Philosophy

通知は必要最小限とする。

大量の通知によってユーザーを疲れさせない。

重要度の高いイベントを優先する。

例

- Task assigned
- Task mentioned
- Task overdue
- Comment added
- Project updated

---

# 24. Empty State Philosophy

Empty Stateは「何もない状態」ではなく、

> 「次に何をすればいいかを教える状態」

として設計する。

例

```text
No projects yet.

Create your first project
to get started.

[ Create Project ]
```

---

# 25. Loading Philosophy

Loading中に画面構造が大きく変化しないようにする。

Skeleton UIを使用する。

原則

```text
Loading
 ↓
Skeleton
 ↓
Content
```

単純なSpinnerだけに依存しない。

---

# 26. Error Philosophy

エラーが発生しても、ユーザーが次の行動を判断できるようにする。

悪い例

```text
Error 500
```

良い例

```text
Something went wrong.

We couldn't load your projects.

[ Try again ]
```

---

# 27. Optimistic UI

操作結果が予測可能な場合はOptimistic Updateを使用する。

特に、

- Task Status変更
- Task Position変更
- Checklist完了
- Notification既読

などで利用する。

---

# 28. Product Performance

PerformanceをProduct Qualityの一部として扱う。

目標

- 初回表示を高速にする
- UI操作への反応を速くする
- 不要なClient JavaScriptを減らす
- 不要なDatabaseアクセスを減らす
- 適切なCachingを利用する

---

# 29. Initial Access Experience

ポートフォリオとして、最初のアクセス体験を特に重視する。

ユーザーが、

> 「接続に時間がかかっている」

と感じないことを目標とする。

Login Page表示時には、認証後にしか必要ないDatabase処理を実行しない。

---

# 30. Product Quality Bar

最低限以下を満たす。

### Visual

- Premium
- Modern
- Consistent
- Responsive

### UX

- Predictable
- Fast
- Accessible
- Keyboard Friendly

### Engineering

- Type Safe
- Tested
- Documented
- Maintainable

---

# 31. Design Direction

デザインの参考として以下を利用する。

- Apple
- Linear
- Vercel
- Stripe
- Raycast
- Notion
- GitHub Projects

ただし、既存サービスをコピーするのではなく、それらから以下の特徴を抽出する。

```text
Apple
→ Elegance

Linear
→ Speed / Focus

Vercel
→ Minimalism

Stripe
→ Information Design

Raycast
→ Keyboard First

Notion
→ Flexibility

GitHub Projects
→ Developer Productivity
```

---

# 32. Visual Identity

基本テーマ

```text
Dark
```

デザインキーワード

```text
Premium
Minimal
Elegant
Modern
Focused
Technical
```

---

# 33. Motion Philosophy

アニメーションは「見せるため」ではなく「理解を助けるため」に使用する。

用途

- Page Transition
- Modal
- Sidebar
- Card Hover
- Loading
- State Change

過剰なアニメーションは禁止する。

---

# 34. Accessibility

AccessibilityをProduct Qualityの一部として扱う。

最低限

- Keyboard Navigation
- Focus State
- aria-label
- Color Contrast
- Reduced Motion
- Semantic HTML

を考慮する。

---

# 35. Responsive Product Strategy

Desktop Firstではなく、すべての画面で適切なUXを提供する。

Desktop

```text
Full Sidebar
Multi-column Layout
Dense Information
```

Tablet

```text
Reduced Sidebar
Adaptive Grid
```

Mobile

```text
Compact Navigation
Single Column
Bottom / Drawer Navigation
```

---

# 36. Mobile Philosophy

MobileではDesktop UIを単純に縮小しない。

情報量を整理し、

> 「最も重要な操作」

を優先する。

---

# 37. Product Scope

## MVP

以下をMVPとする。

```text
Authentication
Dashboard
Projects
Tasks
Kanban
Task Detail
Calendar
Analytics
Profile
Settings
```

---

# 38. Out of Scope

初期Versionでは以下を対象外とする。

```text
Real-time Collaboration
Chat
Email Notification
Push Notification
Payment
Native Mobile App
Advanced Automation
Enterprise SSO
```

---

# 39. Future Product Extensions

将来的に以下を検討する。

```text
AI Task Summary
AI Project Summary
Task Dependencies
Recurring Tasks
Time Tracking
File Storage
Workspace Invitations
Integrations
Webhooks
Automation
Saved Views
Custom Fields
Advanced Search
```

---

# 40. Competitive Positioning

Task Managerは既存のProject Management SaaSと直接競争することを目的としない。

ポートフォリオとして、

> 「小規模チームが実際に使えそうなModern SaaS」

を目指す。

---

# 41. Product Differentiation

主な差別化ポイント。

## 1. Premium UX

一般的な業務システムよりも洗練されたUIを目指す。

## 2. Speed

初回アクセスおよび操作レスポンスを重視する。

## 3. Focus

不要な機能を増やさず、Task Managementに集中する。

## 4. Keyboard Friendly

Command Paletteなどを利用して高速操作を可能にする。

---

# 42. Success Criteria

Productとして以下を満たした場合、成功と判断する。

### User Experience

- 初めて見ても操作方法が理解できる
- 主要操作が迷わず行える
- Desktop / Mobile双方で利用できる

### Visual

- SaaS Productとして違和感がない
- デザインルールが全画面で統一されている
- アニメーションが自然

### Engineering

- TypeScript Errorがない
- Lint Errorがない
- 主要Featureにテストがある
- APIとDatabaseの責務が分離されている

---

# 43. Portfolio Success Criteria

このプロジェクトは通常のプロダクトとは異なり、ポートフォリオとしての評価も重要とする。

第三者がRepositoryまたはDemoを見たとき、

> 「見た目だけではなく、ちゃんと設計している」

と感じられる状態を目標とする。

評価対象

```text
UI / UX
Architecture
Database Design
API Design
Code Quality
Testing
Performance
Documentation
```

---

# 44. Demo Experience

Portfolio訪問者は必ずしも時間をかけてアプリを操作するとは限らない。

そのため、

> 最初の5秒

で品質を伝えられるUIを目指す。

特に重要な画面

```text
Login
Dashboard
Project List
Task Board
Analytics
```

---

# 45. Demo Data

Demo環境では、空のDatabaseを表示しない。

適切なDemo Dataを用意する。

例

```text
Projects
8〜12

Tasks
50〜100

Members
5〜10

Activities
100+
```

これにより、実際に運用されているSaaSのような体験を提供する。

---

# 46. Product Metrics

将来的に以下を計測可能とする。

## Activation

初回Project作成率。

## Engagement

週次アクティブユーザー。

## Task Completion

Task完了率。

## Project Completion

Project完了率。

## Retention

一定期間後の再訪率。

Portfolio用途では実際のKPI運用を目的とせず、Product Analytics設計のデモとして扱う。

---

# 47. Product Decisions

重要なProduct Decisionは`development-log.md`へ記録する。

対象

- Feature追加
- Feature削除
- UX変更
- Architecture変更
- Technology変更
- Scope変更

---

# 48. Relationship With Other Documents

Product Designは他の設計書の上位概念として扱う。

```text
Product
   ↓
Requirements
   ↓
Basic Design
   ↓
Detail Design
   ↓
Architecture
   ↓
Database / API
   ↓
Implementation
```

UIについては、

```text
Product
   ↓
UI Guideline
   ↓
Component Design
   ↓
Screen Design
   ↓
Implementation
```

という関係とする。

---

# 49. Documentation Rules

Productに関する重要な変更が発生した場合は、本ドキュメントを更新する。

ただし、実装詳細をProduct Designへ記載しすぎない。

Product Design

```text
What
Why
For whom
```

Architecture

```text
How
```

を基本とする。

---

# 50. Final Product Principles

Task Managerでは以下をProductの原則とする。

> Make work visible.

> Make priorities clear.

> Make progress understandable.

> Make actions effortless.

> Make complex work feel simple.

最終的な目標は、単なる「Todoアプリ」を作ることではない。

**実際のSaaSとして成立しているように見える、完成度の高いProject Management Productを作ること**である。
