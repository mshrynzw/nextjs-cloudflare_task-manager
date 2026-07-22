# Login画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-001

## 画面名

Login

## URL

```
/login
```

## 目的

ユーザー認証を行い、Task Managerへログインする。

本画面はユーザーが最初に目にする画面であり、プロダクト全体の第一印象を決定する重要な画面である。

---

# 2. 画面レイアウト

```
+-----------------------------------------------------------+
|                                                           |
|                 Gradient Background                       |
|                                                           |
|                 +----------------------+                  |
|                 |        Logo          |                  |
|                 |                      |                  |
|                 |   Task Manager       |                  |
|                 |                      |                  |
|                 |  Email               |                  |
|                 |  Password            |                  |
|                 |                      |                  |
|                 | Remember Me          |                  |
|                 | Forgot Password      |                  |
|                 |                      |                  |
|                 | Sign In              |                  |
|                 |                      |                  |
|                 | Google               |                  |
|                 | GitHub               |                  |
|                 +----------------------+                  |
|                                                           |
+-----------------------------------------------------------+
```

---

# 3. 使用コンポーネント

| コンポーネント  | 用途            |
| --------------- | --------------- |
| Card            | ログインカード  |
| Logo            | アプリロゴ      |
| Heading         | タイトル        |
| Text            | 説明文          |
| Input           | Email           |
| PasswordInput   | Password        |
| Checkbox        | Remember Me     |
| Link            | Forgot Password |
| Button          | Sign In         |
| Button          | Google Sign In  |
| Button          | GitHub Sign In  |
| Separator       | 区切り線        |
| Toast           | エラー表示      |
| Loading Spinner | 認証中表示      |

---

# 4. 入力項目

## Email

| 項目       | 内容  |
| ---------- | ----- |
| 型         | Email |
| 必須       | ○     |
| 最大文字数 | 255   |

---

## Password

| 項目       | 内容     |
| ---------- | -------- |
| 型         | Password |
| 必須       | ○        |
| 最小文字数 | 8        |

---

## Remember Me

| 項目   | 内容     |
| ------ | -------- |
| 型     | Checkbox |
| 初期値 | OFF      |

---

# 5. ボタン一覧

| ボタン          | 動作                   |
| --------------- | ---------------------- |
| Sign In         | ログイン処理           |
| Google Sign In  | Google認証             |
| GitHub Sign In  | GitHub認証             |
| Forgot Password | パスワード再設定画面へ |

---

# 6. バリデーション

## Email

- 必須
- Email形式

エラー例

```
メールアドレスを入力してください
```

```
メールアドレスの形式が正しくありません
```

---

## Password

- 必須
- 8文字以上

エラー例

```
パスワードを入力してください
```

```
8文字以上入力してください
```

---

# 7. ログイン成功時

```
Login

↓

Loading

↓

Dashboard
```

Dashboardへ遷移する。

---

# 8. ログイン失敗時

Toastを表示する。

例

```
メールアドレスまたはパスワードが正しくありません。
```

入力内容は保持する。

---

# 9. ローディング

認証中は

- Buttonを無効化
- Spinner表示
- 二重送信禁止

---

# 10. アニメーション

## 初回表示

GSAP

- Background Fade
- Card Fade
- Card Scale
- Title Fade
- Input Stagger
- Button Fade

---

## Hover

Card

- translateY(-4px)

Button

- Scale 1.02

Input

- Border Color変更

---

## Focus

Input

- Accent Color
- Shadow

---

## Page Transition

Login

↓

Dashboard

Fade Out

Fade In

---

# 11. デザイン仕様

## Theme

Dark

---

## Radius

16px

---

## Shadow

Soft Shadow

---

## Background

Gradient

Blur

Noise

---

## Typography

Primary Font

Geist

---

## Accent Color

Blue

Purple

---

# 12. レスポンシブ

Desktop

カード幅

480px

---

Tablet

420px

---

Mobile

100%

Padding 24px

---

# 13. アクセシビリティ

- labelを設定
- Tab移動対応
- Enterキーで送信
- EscapeでDialogを閉じる
- aria-label設定
- エラーをスクリーンリーダーへ通知

---

# 14. 使用予定ライブラリ

- Auth.js
- React Hook Form
- Zod
- shadcn/ui
- Lucide React
- GSAP

---

# 15. 実装メモ

## Route

```
/login
```

---

## Feature

```
features/auth
```

---

## Components

```
LoginCard

LoginForm

SocialLoginButtons

RememberMe

ForgotPasswordLink

Logo
```

---

## Hooks

```
useLogin

useSocialLogin
```

---

## 将来対応

- MFA（多要素認証）
- パスワード表示切替
- パスキー認証
- Magic Link
- SSO
