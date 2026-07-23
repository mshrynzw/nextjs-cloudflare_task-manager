# Analytics画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-008

## 画面名

Analytics

## URL

```text id="m1p9va"
/analytics
```

## 目的

Analytics画面は、プロジェクトやタスクの進捗状況、生産性、メンバーごとの作業量などをグラフや統計情報で可視化し、意思決定を支援することを目的とする。

---

# 2. レイアウト

```text id="ybkhb8"
+------------------------------------------------------------------------+
| Header                                                                 |
+-----------+------------------------------------------------------------+
| Sidebar   | Toolbar                                                    |
|           |------------------------------------------------------------|
|           | KPI Cards                                                  |
|           |------------------------------------------------------------|
|           | Completion Trend      Task Distribution                    |
|           |------------------------------------------------------------|
|           | Priority Breakdown   Member Workload                       |
|           |------------------------------------------------------------|
|           | Recent Metrics       Upcoming Deadlines                    |
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

Analytics

- StatCard
- LineChartCard
- BarChartCard
- PieChartCard
- HeatmapCard
- MetricsTable

Task

- ProgressBar
- PriorityBadge

その他

- Skeleton
- EmptyState
- Tooltip

---

# 4. Toolbar

表示内容

- Date Range
- Project Filter
- Member Filter
- Export
- Refresh

期間

- 7 Days
- 30 Days
- 90 Days
- 1 Year
- Custom

---

# 5. KPI Cards

表示枚数

6枚

### Total Tasks

```text id="4fjbkx"
482
```

---

### Completed

```text id="b2p1do"
371
```

---

### Completion Rate

```text id="76um0q"
77%
```

---

### Overdue Tasks

```text id="8r6zdy"
12
```

---

### Active Members

```text id="gjnmja"
14
```

---

### Average Completion Time

```text id="gk7my2"
3.8 days
```

---

# 6. Completion Trend

種類

Line Chart

表示内容

日別または週別の完了タスク数

X軸

日付

Y軸

件数

---

# 7. Task Distribution

種類

Donut Chart

分類

- Backlog
- Todo
- In Progress
- Review
- Done

割合を表示する。

---

# 8. Priority Breakdown

種類

Bar Chart

分類

- High
- Medium
- Low

件数を表示する。

---

# 9. Member Workload

種類

Horizontal Bar Chart

表示内容

- Member
- Assigned Tasks
- Completed Tasks

---

# 10. Productivity Heatmap

種類

Heatmap

表示内容

日別のタスク完了数を色で表現する。

---

# 11. Recent Metrics

表形式

表示内容

- Date
- Created
- Completed
- Archived
- Overdue

---

# 12. Upcoming Deadlines

表示件数

10件

表示内容

- Task
- Project
- Due Date
- Priority

クリックでTask Detailへ遷移する。

---

# 13. Export

対応形式

- CSV
- Excel（将来）
- PDF（将来）

エクスポート対象

現在表示中の分析データ

---

# 14. Empty State

分析データが存在しない場合

表示

- Chart Illustration
- メッセージ
- Create Project Button

例

```text id="88y7ef"
Not enough data.

Create tasks to generate analytics.
```

---

# 15. Loading

Skeleton表示

対象

- KPI
- Charts
- Table

---

# 16. Toast

成功

```text id="5cnuhs"
Analytics exported successfully.
```

更新

```text id="slj9rl"
Analytics refreshed.
```

失敗

```text id="j2b2zs"
Failed to load analytics.
```

---

# 17. アニメーション

## 初回表示

GSAP

表示順

Header

↓

Toolbar

↓

KPI

↓

Charts

↓

Metrics

Fade + Stagger

---

## KPI

数値

Count Up Animation

---

## Chart

描画時

Line

左から描画

Bar

下から伸びる

Pie

Sweep Animation

Heatmap

順番にFade

---

## Hover

Chart

Tooltip表示

Card

- translateY(-3px)
- Shadow強化

---

## Refresh

ChartをCross Fadeで更新

---

# 18. レスポンシブ

Desktop

2列グリッド

---

Tablet

1〜2列

---

Mobile

1列

Chartを縦に並べる。

SidebarはDrawerへ変更する。

Bottom Navigationを表示する。

---

# 19. アクセシビリティ

- キーボード操作対応
- Focus Ring表示
- aria-label設定
- スクリーンリーダー対応
- グラフに代替テーブルを用意

---

# 20. 使用Hooks

```text id="zzedib"
useAnalytics()

useCompletionTrend()

useTaskDistribution()

useMemberWorkload()

useProductivityHeatmap()
```

---

# 21. 使用Feature

```text id="n6jlwm"
features/analytics

features/task

features/project
```

---

# 22. 使用予定コンポーネント

```text id="mvygkn"
StatCard

LineChartCard

BarChartCard

PieChartCard

HeatmapCard

MetricsTable

ProgressBar

PriorityBadge

SearchInput

FilterDropdown

Dialog

Toast

Skeleton

EmptyState
```

---

# 23. グラフライブラリ

採用ライブラリ

```text id="vqntqb"
Recharts
```

利用予定グラフ

- Line Chart
- Bar Chart
- Pie / Donut Chart
- Area Chart
- Composed Chart

---

# 24. 将来追加予定

- バーンダウンチャート
- ベロシティチャート
- リードタイム分析
- サイクルタイム分析
- AIによるプロジェクト分析
- 予測完了日シミュレーション
- メンバー稼働率分析
- カスタムダッシュボード
- レポート自動生成
- 定期レポート配信
