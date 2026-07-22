# Project List画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-003

## 画面名

Project List

## URL

```text
/projects
```

## 目的

Project List画面は、登録されているプロジェクトを一覧表示し、検索・フィルター・ソートを行いながら目的のプロジェクトへ素早くアクセスできることを目的とする。

また、新規プロジェクトの作成や Project Detail 画面への導線として機能する。

---

# 2. レイアウト

```text
+---------------------------------------------------------------+
| Header                                                        |
+-----------+---------------------------------------------------+
| Sidebar   | Search                     New Project            |
|           |---------------------------------------------------|
|           | Filter   Sort   View Switch                       |
|           |---------------------------------------------------|
|           |                                                   |
|           |               Project Cards                       |
|           |                                                   |
|           |                                                   |
|           |---------------------------------------------------|
|           | Pagination                                        |
+-----------+---------------------------------------------------+
```

---

# 3. 使用コンポーネント

共通

- Sidebar
- Header
- SearchInput
- FilterDropdown
- SortDropdown
- ViewSwitcher
- Pagination

プロジェクト

- ProjectCard
- ProgressBar
- AvatarGroup
- Badge

その他

- EmptyState
- Skeleton
- Dialog
- Toast

---

# 4. Header

表示項目

- ページタイトル
- 検索
- 通知
- Command Palette
- User Menu

---

# 5. Toolbar

表示内容

- Search
- Filter
- Sort
- View切替
- New Project Button

---

# 6. Project Card

表示内容

### 基本情報

- プロジェクト名
- 説明
- プロジェクトカラー

### ステータス

- Active
- Planning
- On Hold
- Completed
- Archived

Badgeで表示する。

### Progress

Progress Bar

例

```text
72%
```

---

### Deadline

例

```text
2026-09-30
```

期限切れの場合は赤色表示。

---

### Members

Avatar Stackで表示。

最大4名表示。

5人以上は

```text
+3
```

のように表示する。

---

### Tags

複数表示可能。

例

- Design
- Frontend
- Backend
- Marketing

---

### Footer

表示内容

- Task数
- Completed数
- Open Project Button

---

# 7. 検索

対象

- Project Name
- Description
- Tags

リアルタイム検索を想定する。

---

# 8. Filter

対応項目

Status

- All
- Active
- Planning
- On Hold
- Completed
- Archived

Priority

- High
- Medium
- Low

Member

Tag

Deadline

---

# 9. Sort

並び順

- Recently Updated
- Created Date
- Deadline
- Progress
- Name

---

# 10. View Switch

切替

- Card View
- List View

将来的に

- Table View

へ拡張可能とする。

---

# 11. Pagination

Desktop

20件表示

Mobile

10件表示

ページ番号表示。

---

# 12. New Project

クリックすると

New Project Dialog

を表示する。

入力項目

- Name
- Description
- Color
- Deadline
- Members

保存後

Toast表示。

---

# 13. Empty State

プロジェクトが存在しない場合

表示内容

- SVG Illustration
- タイトル
- 説明
- Create Project Button

例

```text
No projects yet.

Create your first project and start organizing your work.
```

---

# 14. Loading

Skeleton表示

対象

- Search
- Toolbar
- Card
- Pagination

---

# 15. Toast

成功

```text
Project created successfully.
```

更新

```text
Project updated.
```

削除

```text
Project deleted.
```

失敗

```text
Failed to load projects.
```

---

# 16. Context Menu

Project Card右上

内容

- Open
- Edit
- Duplicate
- Archive
- Delete

Deleteのみ危険操作として表示する。

---

# 17. アニメーション

## 初回表示

GSAP

順番

Header

↓

Toolbar

↓

Cards

カードは

Stagger Animation

で表示する。

---

## Hover

Card

- translateY(-6px)
- Scale 1.01
- Shadow強化

Button

- Scale 1.02

Progress

HoverでTooltip表示。

---

## Dialog

Fade

Scale

---

## Filter

Dropdown

Fade

---

## View切替

Cross Fade

---

# 18. レスポンシブ

Desktop

4列

---

Large Tablet

3列

---

Tablet

2列

---

Mobile

1列

SidebarはDrawer化する。

Bottom Navigationを表示する。

---

# 19. アクセシビリティ

- キーボード操作対応
- aria-label設定
- Focus Ring表示
- Skip Navigation対応

---

# 20. 使用Hooks

```text
useProjects()

useProjectSearch()

useProjectFilter()

useProjectSort()

usePagination()
```

---

# 21. 使用Feature

```text
features/project
```

---

# 22. 使用予定コンポーネント

```text
ProjectCard

ProjectToolbar

SearchInput

FilterDropdown

SortDropdown

ViewSwitcher

ProgressBar

AvatarGroup

Badge

Pagination

EmptyState

Skeleton
```

---

# 23. 将来追加予定

- Favorite Projects
- Recently Viewed
- AI Project Summary
- Drag & Drop Sort
- Bulk Edit
- Bulk Delete
- Export CSV
- Import CSV
- Project Templates
- Color Themes
