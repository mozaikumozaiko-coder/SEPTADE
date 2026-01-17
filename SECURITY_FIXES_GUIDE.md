# Supabaseセキュリティ設定ガイド

このガイドでは、検出されたセキュリティ問題を修正する方法を説明します。

## 🔧 修正が必要な項目

### 1. ✅ Auth DB Connection Strategy（接続戦略の変更）

**問題**: Auth サーバーが固定の10接続を使用するように設定されています。パーセンテージベースの接続割り当てに切り替える必要があります。

**修正手順**:
1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクト `abdawqdcwcwpgqqwabcn` を選択
3. 左メニューから **Settings** → **Database** を選択
4. **Connection pooling** セクションを見つける
5. **Auth Connection Pool Mode** を **Percentage** に変更
6. 推奨値: **10-20%** に設定
7. **Save** をクリック

---

### 2. ✅ Anonymous Access Policies（匿名アクセスの無効化）

**問題**: 匿名サインインが有効になっています。セキュリティ向上のため無効にする必要があります。

**修正手順**:
1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクト `abdawqdcwcwpgqqwabcn` を選択
3. 左メニューから **Authentication** → **Providers** を選択
4. **Email** プロバイダーを見つける
5. 以下の設定を確認・変更:
   - ✅ **Confirm email**: ONにする（メール確認を有効化）
   - ✅ **Enable anonymous sign-ins**: OFFにする
6. **Save** をクリック

**追加のセキュリティ設定**:
1. **Authentication** → **URL Configuration** に移動
2. **Site URL** を本番環境のURLに設定
3. **Redirect URLs** に許可するURLのみを追加

---

### 3. ✅ Leaked Password Protection（漏洩パスワード保護）

**問題**: HaveIBeenPwned.orgとの連携が無効になっています。漏洩したパスワードの使用を防ぐため有効にする必要があります。

**修正手順**:
1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクト `abdawqdcwcwpgqqwabcn` を選択
3. 左メニューから **Authentication** → **Policies** を選択
4. **Password Policies** セクションを見つける
5. 以下の設定を有効化:
   - ✅ **Enable HaveIBeenPwned password check**: ONにする
   - ✅ **Minimum password length**: 8文字以上を推奨
   - ✅ **Require lowercase**: ONを推奨
   - ✅ **Require uppercase**: ONを推奨
   - ✅ **Require numbers**: ONを推奨
   - ✅ **Require special characters**: ONを推奨
6. **Save** をクリック

---

## 📋 設定変更後の確認事項

すべての設定変更後、以下を確認してください：

### 1. Auth接続の確認
```sql
-- Database の Query Editor で実行
SELECT
  count(*) as active_connections,
  usename,
  application_name
FROM
  pg_stat_activity
WHERE
  usename LIKE '%auth%'
GROUP BY
  usename, application_name;
```

### 2. 新規ユーザー登録のテスト
- 弱いパスワード（例: "password123"）で登録を試み、拒否されることを確認
- 漏洩したパスワードで登録を試み、拒否されることを確認
- 強いパスワードで正常に登録できることを確認

### 3. メール確認フローのテスト
- 新規登録後、メール確認が必要になることを確認
- 確認メールが届き、リンクをクリックして認証できることを確認

---

## 🔐 追加のセキュリティ推奨事項

### Rate Limiting（レート制限）の設定

1. **Authentication** → **Rate Limits** に移動
2. 以下の制限を設定:
   - **Email sign-ups**: 10 per hour (推奨)
   - **Email sign-ins**: 30 per hour (推奨)
   - **Password reset**: 10 per hour (推奨)
   - **OTP requests**: 10 per hour (推奨)

### Session Management（セッション管理）

1. **Authentication** → **Settings** に移動
2. 以下を設定:
   - **JWT expiry**: 3600 秒（1時間）推奨
   - **Refresh token rotation**: ON（推奨）
   - **Reuse interval**: 10 秒（推奨）

### Multi-Factor Authentication（MFA）

1. **Authentication** → **Policies** に移動
2. **MFA** セクションで:
   - **Enable MFA**: ON（推奨）
   - **Allow users to enroll**: ON

---

## 📝 変更ログ

設定変更を記録しておくことをお勧めします：

| 日付 | 変更項目 | 変更内容 | 変更者 |
|------|---------|---------|--------|
| YYYY-MM-DD | Auth Connection Pool | Percentage modeに変更（15%） | - |
| YYYY-MM-DD | Anonymous Sign-in | 無効化 | - |
| YYYY-MM-DD | Password Protection | HaveIBeenPwned有効化 | - |

---

## 🆘 トラブルシューティング

### 問題: ユーザーがログインできなくなった
- **解決策**: メール確認を有効にした場合、既存ユーザーの `email_confirmed_at` が設定されているか確認

### 問題: パスワードリセットが機能しない
- **解決策**: SMTP設定が正しいか確認（Settings → Auth → Email）

### 問題: 接続プールの変更後にエラーが発生する
- **解決策**: パーセンテージを調整（5-20%の範囲で試す）

---

## 📚 参考リンク

- [Supabase Auth Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [Database Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Password Security](https://supabase.com/docs/guides/auth/passwords)
- [Rate Limiting](https://supabase.com/docs/guides/auth/rate-limits)

---

## ✅ チェックリスト

設定完了後、以下をチェックしてください：

- [ ] Auth接続戦略をパーセンテージベースに変更
- [ ] 匿名サインインを無効化
- [ ] HaveIBeenPwned連携を有効化
- [ ] パスワードポリシーを強化
- [ ] レート制限を設定
- [ ] 新規登録・ログインのテスト実施
- [ ] 既存ユーザーのログインテスト実施

---

**注意**: これらの設定変更は本番環境に影響を与える可能性があります。変更前にバックアップを取り、テスト環境で確認することをお勧めします。
