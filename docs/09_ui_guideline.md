# UI Guideline

Version: 1.0

---

# 1. Purpose

本ドキュメントは Task Manager のデザインシステムを定義する。

目的は以下とする。

- UIの一貫性を保つ
- デザイン品質を維持する
- Cursor・Claude・ChatGPT が同じルールでUIを生成できるようにする
- コンポーネントの再利用性を向上させる

---

# 2. Design Philosophy

本アプリは以下の世界観を目指す。

- Apple
- Linear
- Vercel
- Stripe Dashboard
- GitHub Projects
- Raycast
- Notion

キーワード

- Premium
- Minimal
- Elegant
- Modern
- Productivity

---

# 3. Color Tokens

すべての色はCSS変数として定義する。

```css
:root {
  /* Background */

  --bg-base: #09090b;
  --bg-surface: #111114;
  --bg-elevated: #18181b;

  /* Border */

  --border: #27272a;
  --border-hover: #3f3f46;

  /* Primary */

  --accent: #4f7cff;
  --accent-hover: #6d8dff;

  /* Success */

  --success: #22c55e;

  /* Warning */

  --warning: #f59e0b;

  /* Danger */

  --danger: #ef4444;

  /* Text */

  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
}
```

画面固有の色を定義してはいけない。

必ず上記トークンを利用する。

---

# 4. Typography

Font Family

```css
Geist
```

Font Weight

| 用途    | Weight |
| ------- | ------ |
| Hero    | 700    |
| Heading | 600    |
| Body    | 400    |
| Caption | 400    |

Line Height

| 用途    | 値  |
| ------- | --- |
| Heading | 1.2 |
| Body    | 1.6 |
| Caption | 1.5 |

---

# 5. Radius

統一する。

| 用途   | 値   |
| ------ | ---- |
| Button | 14px |
| Card   | 16px |
| Dialog | 18px |
| Input  | 14px |

画面によって変更しない。

---

# 6. Shadow

Card

```css
0 8px 30px rgba(0,0,0,.18)
```

Hover

```css
0 12px 40px rgba(0,0,0,.28)
```

Dialog

```css
0 24px 80px rgba(0,0,0,.45)
```

---

# 7. Spacing

8px Gridを採用する。

使用可能値

```text
4

8

12

16

24

32

40

48

64

80
```

これ以外は使用しない。

---

# 8. Layout

Container

```text
1440px
```

Content Width

```text
1280px
```

Sidebar

```text
280px
```

Header

```text
72px
```

---

# 9. Grid

Desktop

```text
12 Columns
```

Tablet

```text
8 Columns
```

Mobile

```text
4 Columns
```

Gap

```text
24px
```

---

# 10. Icon

Lucide React を採用する。

サイズ

| 用途    | サイズ |
| ------- | ------ |
| Small   | 16px   |
| Default | 20px   |
| Large   | 24px   |

Stroke

```text
1.75
```

---

# 11. Motion

GSAPを採用する。

Duration

| 用途    | 時間  |
| ------- | ----- |
| Fast    | 0.2s  |
| Default | 0.35s |
| Slow    | 0.6s  |

Ease

```text
power2.out
```

禁止

- Bounce
- Elastic
- 過度な回転
- 過度な拡大縮小

---

# 12. Hover

Card

```css
transform: translateY(-4px);
```

Button

```css
scale(1.02)
```

Input

Border Color変更

---

# 13. Loading

すべてSkeletonを使用する。

Spinnerのみは禁止。

---

# 14. Empty State

必須要素

- SVG
- タイトル
- 説明
- CTAボタン

文字だけは禁止。

---

# 15. Toast

右上表示

Auto Close

```text
3 sec
```

---

# 16. Dialog

最大幅

```text
640px
```

Padding

```text
32px
```

Backdrop Blur

```text
8px
```

---

# 17. Card

Padding

```text
24px
```

Gap

```text
16px
```

Radius

```text
16px
```

---

# 18. Input

高さ

```text
48px
```

Padding

```text
16px
```

Radius

```text
14px
```

---

# 19. Button

Primary

Filled

Secondary

Outline

Ghost

Danger

サイズ

| 種類    | 高さ |
| ------- | ---- |
| Small   | 36px |
| Default | 44px |
| Large   | 52px |

---

# 20. Accessibility

最低コントラスト

```text
WCAG AA
```

Keyboard Navigation

必須

Focus Ring

必須

aria-label

必須

---

# 21. Responsive

Desktop

1440px〜

Tablet

768px〜1439px

Mobile

〜767px

---

# 22. Design Rules

必須

- 余白を十分確保する
- カード中心のUI
- シンプルな情報設計
- コンポーネントを再利用する
- CSS変数を利用する
- FeatureごとにUIを分離する

禁止

- Bootstrap風デザイン
- ベタ書きカラー
- ハードコードされた余白
- 過剰なグラデーション
- Glassmorphismの多用
- 派手なアニメーション
- 画面ごとの独自デザイン

---

# 23. Cursor Rules

Cursorは以下を必ず守ること。

- 新しい色を追加しない
- CSS変数を利用する
- Tailwind Utilityを優先する
- 共通コンポーネントを優先する
- 新しいUIを作る前に既存コンポーネントを再利用する
- 画面間でデザインルールを統一する
- ui-referenceを参考に実装する

---

# 24. Future

将来的にDesign Systemを以下へ拡張予定。

- Button Guideline
- Card Guideline
- Form Guideline
- Chart Guideline
- Motion Guideline
- Icon Guideline
- Dark Theme Guideline
- Accessibility Guideline
