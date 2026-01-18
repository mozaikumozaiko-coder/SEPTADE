# Supabase Security Configuration Guide

このガイドでは、プロジェクトで特定されたセキュリティ問題とその解決方法について説明します。

詳細な実装ガイドは **SECURITY_IMPLEMENTATION.md** を参照してください。

## ✅ 自動的に修正済み（コードレベル）

以下の問題は、コードとSQLマイグレーションで自動的に解決されています：

### データベースセキュリティ
- ✅ **Function Search Path Security** - `verify_rls_enabled()` 関数に不変のsearch_pathを設定
- ✅ **Row Level Security** - すべてのテーブルでRLSが有効化され、適切な認証ポリシーが設定済み
- ✅ **Ownership Verification** - すべてのポリシーで `auth.uid()` による所有権検証を実装

### アプリケーションセキュリティ（新規実装）
- ✅ **Leaked Password Protection（クライアント側）** - HaveIBeenPwned APIを使用したパスワード漏洩チェックを実装
  - 実装場所: `src/utils/passwordSecurity.ts`
  - 新規登録時に自動的にチェック
  - SHA-1ハッシュによるk-Anonymity方式で安全に検証
  - プレーンテキストのパスワードは送信されません

- ✅ **Password Strength Validation** - 強力なパスワード要件を実装
  - 最小8文字
  - 大文字・小文字・数字を含む
  - データ漏洩履歴のチェック

- ✅ **Anonymous Access Prevention（コードレベル）** - アプリケーションでは匿名サインインを使用していません
  - メール/パスワード認証のみ実装
  - すべてのRLSポリシーで認証ユーザーのみアクセス可能

## ⚠️ IMPORTANT: Dashboard Configuration Required

The following issues CANNOT be fixed via SQL migrations. You MUST configure them in the Supabase Dashboard.

## 🔴 Critical Security Issues Requiring Manual Configuration

### 1. Auth DB Connection Strategy (REQUIRED - Dashboard Only)

**Issue:** Your Auth server uses a fixed number (10) of connections, limiting scalability.

**Action Required - Configure in Supabase Dashboard:**

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection Pooling** section
4. Find **Auth Server Connection Pool** setting
5. Change from **Fixed Number (10)** to **Percentage-Based**
6. Set to **15-20%** of available connections (recommended starting point)
7. Click **Save** or **Update**

**Why:** This allows the Auth server to scale with your database instance size automatically.

**Status:** ⚠️ REQUIRES MANUAL DASHBOARD CONFIGURATION

---

### 2. Disable Anonymous Sign-ins (RECOMMENDED - Dashboard Configuration)

**現在の状態:** アプリケーションは匿名サインインを使用していません

**アプリケーション側の対策:**
- メール/パスワード認証のみ実装
- すべてのRLSポリシーで `auth.uid()` による認証チェック
- 未認証ユーザーはデータにアクセス不可

**Supabase Dashboard での設定（推奨）:**

完全に無効化するため、ダッシュボードで設定を変更することを推奨します：

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **Authentication** → **Providers**
3. Scroll down to find **Anonymous Sign-ins** section
4. Toggle the switch to **OFF** (disabled)
5. Click **Save** or **Confirm**

**Why:** アプリケーションで使用していない機能を無効化することで、攻撃対象領域を減らします。

**Status:** ✅ NOT USED IN APP (Dashboard configuration recommended for complete protection)

---

### 3. Enable Leaked Password Protection (OPTIONAL - クライアント側で実装済み)

**現在の状態:** ✅ クライアント側で既に実装されています

**実装内容:**
- `src/utils/passwordSecurity.ts` でHaveIBeenPwned APIとの統合
- 新規登録時に自動的にパスワード漏洩チェック
- SHA-1ハッシュによるk-Anonymity方式で安全に検証

**Supabase側での追加設定（オプション）:**

Supabase側でも二重チェックを有効にしたい場合：

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **Authentication** → **Policies** (or **Settings**)
3. Find **Password Protection** or **Security** section
4. Enable the toggle for **"Check passwords against HaveIBeenPwned.org"** or **"Breach password protection"**
5. Click **Save** or **Update**

**注意:** この設定はオプションです。クライアント側で既に同じチェックを実装しているため、Supabase側の設定は追加の保護層として機能します。

**Status:** ✅ IMPLEMENTED IN CLIENT CODE (Dashboard configuration is optional)

---

## ✅ Additional Security Best Practices

### 4. Email Confirmation Settings

**Current Status:** Email confirmation is disabled (which is fine for development)

**For Production:**
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **"Confirm email"**
3. Configure your email templates

### 5. Rate Limiting (Recommended)

1. Go to Supabase Dashboard → **Authentication** → **Rate Limits**
2. Set appropriate limits:
   - **Email sign-ups:** 10 per hour per IP
   - **Email sign-ins:** 30 per hour per IP
   - **Password resets:** 5 per hour per IP

### 6. JWT Expiry Settings

1. Go to Supabase Dashboard → **Settings** → **Auth**
2. Set **JWT expiry** to appropriate value (default: 3600 seconds / 1 hour)
3. Enable **Auto-refresh tokens** if needed

---

## 🛡️ RLS Policy Status (Already Secure)

Your Row Level Security policies are properly configured:

✅ **diagnosis_history** - Users can only access their own records
✅ **reports** - Users can only access their own reports
✅ **user_profiles** - Users can only access their own profile
✅ All policies require authentication
✅ No anonymous access policies
✅ Proper ownership checks using `auth.uid()`

---

## 📋 Security Checklist

Before deploying to production, verify:

- [ ] Auth connection strategy set to percentage-based (15-20%)
- [ ] Anonymous sign-ins disabled
- [ ] Leaked password protection enabled
- [ ] Email confirmation enabled
- [ ] Rate limiting configured
- [ ] JWT expiry set appropriately
- [ ] Site URL and redirect URLs configured
- [ ] RLS enabled on all tables
- [ ] All policies require authentication
- [ ] Environment variables secured
- [ ] API keys not exposed in client code

---

## 🔗 Useful Links

- [Supabase Database Advisors](https://supabase.com/docs/guides/database/database-advisors)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Auth Configuration](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 📝 Notes

- These settings must be changed in the Supabase Dashboard (Web UI)
- They cannot be configured via SQL migrations
- Changes take effect immediately
- Test thoroughly after making changes
- Keep your Supabase project on the latest version
