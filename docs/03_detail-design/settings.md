# Settings画面 詳細設計書

---

# 1. 画面概要

## 画面ID

SCR-009

## 画面名

Settings

## URL

```text
/settings
```

## 目的

Settings画面は、ユーザーアカウントおよびアプリケーション全体の設定を管理する画面である。

プロフィール、表示設定、通知、セキュリティなどをカテゴリごとに整理し、快適かつ安全にアプリを利用できる環境を提供する。

---

# 2. レイアウト

```text
+--------------------------------------------------------------------------+
| Header                                                                   |
+-----------+--------------------------------------------------------------+
| Sidebar   | Settings Navigation | Content Area                           |
|           |---------------------|----------------------------------------|
|           | Profile             |                                        |
|           | Appearance          |                                        |
|           | Notifications       |                                        |
|           | Security            |                                        |
|           | Account             |                                        |
|           | Integrations        |                                        |
|           | About               |                                        |
+-----------+--------------------------------------------------------------+
```

---

# 3. 使用コンポーネント

共通

- Sidebar
- Header
- Card
- Dialog
- Toast
- Tabs
- Tooltip

Settings

- SettingsNav
- SettingsSection
- Switch
- Select
- Input
- PasswordInput
- ColorPicker
- DangerZone

その他

- Skeleton
- EmptyState

---

# 4. 設定カテゴリ

左ナビゲーション

- Profile
- Appearance
- Notifications
- Security
- Account
- Integrations
- About

カテゴリ切替時はURLを更新する。

例

```text
/settings/profile

/settings/security
```

---

# 5. Profile

表示項目

- Display Name
- Username
- Email（閲覧のみ）
- Job Title
- Bio
- Time Zone
- Language

操作

- Save Changes

---

# 6. Appearance

設定項目

Theme

- Light
- Dark
- System

Accent Color

- Blue
- Purple
- Emerald
- Orange
- Rose

Density

- Comfortable
- Compact

Sidebar

- Expanded
- Collapsed

Animation

- Enabled
- Reduced

---

# 7. Notifications

通知方法

- Email
- In-app

通知対象

- Assigned Tasks
- Mentions
- Comments
- Due Soon
- Project Updates
- Weekly Summary

各項目をSwitchで切り替える。

---

# 8. Security

設定項目

- Change Password
- Two-Factor Authentication（将来）
- Active Sessions
- Login History（将来）

Active Sessions

表示内容

- Device
- Browser
- IP Address（マスク表示）
- Last Active

現在利用中のセッションには

```text
Current Session
```

バッジを表示する。

---

# 9. Account

表示内容

- Account ID
- Created At
- Plan
- Delete Account

Danger Zone

操作

- Delete Account

確認ダイアログを表示する。

---

# 10. Integrations

将来対応

- GitHub
- Slack
- Discord
- Google Calendar
- Notion

各サービス

- Connected
- Connect
- Disconnect

状態を表示する。

---

# 11. About

表示内容

- Application Name
- Version
- License
- Build Date
- Repository

Repositoryはリンク表示する。

---

# 12. Dialog

Change Password

入力項目

- Current Password
- New Password
- Confirm Password

Delete Account

確認入力

```text
DELETE
```

入力後のみ削除可能とする。

---

# 13. Validation

Password

- 8文字以上
- 英数字を含む

Username

- 英数字
- 重複不可

Display Name

- 50文字以内

Bio

- 300文字以内

---

# 14. Loading

Skeleton表示

対象

- Settings Navigation
- Form
- Card

---

# 15. Toast

成功

```text
Settings saved successfully.
```

更新

```text
Password updated.
```

削除

```text
Account deleted.
```

失敗

```text
Failed to save settings.
```

---

# 16. アニメーション

## 初回表示

GSAP

表示順

Header

↓

Navigation

↓

Content

Fade + Stagger

---

## タブ切替

Cross Fade

---

## Hover

Card

- translateY(-2px)
- Shadow強化

Button

- Scale 1.02

Switch

Smooth Toggle Animation

---

## Dialog

Fade

Scale

---

# 17. レスポンシブ

Desktop

左ナビ + コンテンツ

---

Tablet

ナビゲーション幅を縮小

---

Mobile

カテゴリをDrawerまたはDropdownに変更

フォームは1カラム表示とする。

---

# 18. アクセシビリティ

- キーボード操作対応
- Focus Ring表示
- aria-label設定
- スクリーンリーダー対応
- エラーメッセージを適切に関連付ける

---

# 19. 使用Hooks

```text
useSettings()

useProfileSettings()

useAppearanceSettings()

useNotificationSettings()

useSecuritySettings()
```

---

# 20. 使用Feature

```text
features/settings

features/auth

features/user
```

---

# 21. 使用予定コンポーネント

```text
SettingsNav

SettingsSection

SettingsCard

Input

PasswordInput

Switch

Select

ColorPicker

DangerZone

Dialog

Toast

Skeleton
```

---

# 22. 将来追加予定

- API Token管理
- Webhook設定
- キーボードショートカット設定
- カスタムテーマ
- 通知スケジュール
- データのエクスポート
- データのインポート
- アカウントバックアップ
- ベータ機能の有効化
- 多言語追加
