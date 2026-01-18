# Supabase Security Configuration Guide

This guide addresses the security issues identified in your Supabase project.

## 🔴 Critical Security Issues to Fix

### 1. Auth DB Connection Strategy (Change to Percentage-Based)

**Issue:** Your Auth server uses a fixed number (10) of connections, limiting scalability.

**Fix Steps:**
1. Go to Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection Pooling** section
3. Find **Auth Server Connection Pool**
4. Change from **Fixed Number (10)** to **Percentage-Based**
5. Set to **15-20%** of available connections (recommended)
6. Click **Save**

**Why:** This allows the Auth server to scale with your database instance size.

---

### 2. Disable Anonymous Sign-ins

**Issue:** Anonymous access is enabled, allowing unauthenticated users to create sessions.

**Fix Steps:**
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Anonymous Sign-ins** section
3. Toggle it **OFF** (disabled)
4. Click **Save**

**Why:** Your app requires email/password authentication. Anonymous access creates security risks and bypasses your RLS policies.

---

### 3. Enable Leaked Password Protection

**Issue:** Compromised password checking is disabled.

**Fix Steps:**
1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Find **Password Protection** section
3. Enable **"Check passwords against HaveIBeenPwned.org"**
4. Click **Save**

**Why:** This prevents users from using passwords that have been exposed in data breaches, significantly improving security.

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
