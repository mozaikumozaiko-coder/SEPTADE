# Supabase Security Configuration Guide

This guide addresses the security issues identified in your Supabase project.

## ✅ Fixed Automatically (via SQL migrations)

The following issues have been resolved:
- ✅ **Function Search Path Security** - Fixed `verify_rls_enabled()` function with immutable search_path
- ✅ **Row Level Security** - All tables have RLS enabled with proper authentication policies
- ✅ **Ownership Verification** - All policies verify user ownership using `auth.uid()`

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

### 2. Disable Anonymous Sign-ins (REQUIRED - Dashboard Only)

**Issue:** Anonymous access is enabled, allowing unauthenticated users to create sessions without credentials.

**Action Required - Configure in Supabase Dashboard:**

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **Authentication** → **Providers**
3. Scroll down to find **Anonymous Sign-ins** section
4. Toggle the switch to **OFF** (disabled)
5. Click **Save** or **Confirm**

**Why:** Your app requires email/password authentication. Anonymous access creates security risks and can bypass your RLS policies.

**Status:** ⚠️ REQUIRES MANUAL DASHBOARD CONFIGURATION

---

### 3. Enable Leaked Password Protection (REQUIRED - Dashboard Only)

**Issue:** Compromised password checking is disabled, allowing users to set passwords that have been exposed in data breaches.

**Action Required - Configure in Supabase Dashboard:**

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **Authentication** → **Policies** (or **Settings**)
3. Find **Password Protection** or **Security** section
4. Enable the toggle for **"Check passwords against HaveIBeenPwned.org"** or **"Breach password protection"**
5. Click **Save** or **Update**

**Why:** This prevents users from using passwords that have been exposed in known data breaches, significantly improving account security.

**Status:** ⚠️ REQUIRES MANUAL DASHBOARD CONFIGURATION

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
