# Supabase Security Configuration Guide

These security issues require configuration changes in the Supabase Dashboard. Follow these steps:

## 1. Fix Auth DB Connection Strategy (Percentage-based)

**Issue**: Auth server uses fixed 10 connections instead of percentage-based allocation.

**Steps to Fix**:
1. Open Supabase Dashboard: https://supabase.com/dashboard/project/abdawqdcwcwpgqqwabcn
2. Go to **Project Settings** (gear icon in sidebar)
3. Click **Database** in the left menu
4. Scroll to **Connection Pooling** section
5. Find the **Auth pool mode** setting
6. Change from **Transaction mode with fixed connections** to **Percentage-based**
7. Set percentage to **10-15%** (recommended for most projects)
8. Click **Save**

## 2. Disable Anonymous Access

**Issue**: Anonymous sign-ins are enabled, allowing unauthenticated access.

**Steps to Fix**:
1. In Supabase Dashboard, go to **Authentication** (in sidebar)
2. Click **Providers** in the submenu
3. Scroll down to find **Anonymous Sign-ins**
4. Toggle it **OFF** (disable anonymous sign-ins)
5. Click **Save**

**Alternative via SQL** (if you need to keep anonymous disabled):
This is a configuration setting that persists across deployments. The Dashboard method is recommended.

## 3. Enable Leaked Password Protection

**Issue**: Password breach detection via HaveIBeenPwned is disabled.

**Steps to Fix**:
1. In Supabase Dashboard, go to **Authentication**
2. Click **Policies** in the submenu
3. Find **Password Protection** section
4. Enable **"Check passwords against HaveIBeenPwned"**
5. Click **Save**

This will:
- Check new passwords against known breached passwords
- Reject passwords found in data breaches
- Enhance user account security

## Verification

After making these changes:

1. **Connection Strategy**: You should see auth connections scale with database load
2. **Anonymous Access**: Users must create accounts to access the app
3. **Password Protection**: Try signing up with a common password like "password123" - it should be rejected

## Important Notes

- These settings are **project-level configurations** and cannot be changed via SQL migrations
- They persist across deployments and database resets
- Changes take effect immediately without requiring app restart
- Your current RLS policies are already secure and properly restrict access to authenticated users only

## Current Security Status

✅ **Already Secure**:
- All RLS policies check `auth.uid()`
- No public access to sensitive data
- User data properly isolated
- Proper ownership checks on all tables

⚠️ **Needs Dashboard Configuration**:
- Connection pooling strategy
- Anonymous sign-ins
- Password breach detection

---

**Dashboard Access**: https://supabase.com/dashboard/project/abdawqdcwcwpgqqwabcn

If you cannot access the dashboard, you may need to:
- Check which account created the project
- Look for invitation emails from Supabase
- Contact Supabase support for account recovery
