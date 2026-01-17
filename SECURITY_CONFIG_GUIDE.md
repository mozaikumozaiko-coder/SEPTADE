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

## 2. Anonymous Access Policies - FIXED ✅

**Status**: This issue has been resolved via database migration.

**What was fixed**:
- Removed all policies that allowed anonymous (anon) access
- Removed `USING (true)` policies from diagnosis_history table
- Removed `WITH CHECK (true)` policies that bypassed RLS
- All data now requires authentication

**Note**: If you want to completely disable anonymous sign-ins as a feature (not just RLS):
1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Anonymous Sign-ins** and toggle it OFF
3. However, this is optional since RLS already blocks anonymous access

## 3. Enable Leaked Password Protection

**Issue**: Password breach detection via HaveIBeenPwned is disabled.

**Steps to Fix**:
1. In Supabase Dashboard, go to **Authentication**
2. Click **Settings** in the submenu (not Policies)
3. Scroll down to **Security and Protection** section
4. Find **Password breach detection**
5. Enable **"Enable leaked password protection"**
6. Click **Save**

This will:
- Check new passwords against known breached passwords database
- Reject passwords found in data breaches
- Enhance user account security
- Applies to new signups and password changes

## Verification

After making the dashboard changes:

1. **Connection Strategy**: Run this query to verify percentage-based pooling is active:
   ```sql
   SHOW pool_mode;
   ```

2. **Password Protection**: Test by:
   - Try signing up with a known breached password like "password123"
   - It should be rejected with an error message

3. **RLS Policies** (already fixed): Test by:
   - Try accessing data without authentication (should fail)
   - Try accessing another user's data (should fail)
   - Verify you can only see your own data

## Important Notes

- These settings are **project-level configurations** and cannot be changed via SQL migrations
- They persist across deployments and database resets
- Changes take effect immediately without requiring app restart
- Your current RLS policies are already secure and properly restrict access to authenticated users only

## Current Security Status

✅ **Fixed via Migration** (completed):
- All RLS policies now require authentication
- Removed anonymous access policies (`USING (true)` and `WITH CHECK (true)`)
- All policies check `auth.uid()` for ownership
- User data properly isolated
- Proper ownership checks on all tables

⚠️ **Needs Dashboard Configuration** (manual steps required):
- Connection pooling strategy (switch to percentage-based)
- Password breach detection (enable HaveIBeenPwned check)

---

**Dashboard Access**: https://supabase.com/dashboard/project/abdawqdcwcwpgqqwabcn

If you cannot access the dashboard, you may need to:
- Check which account created the project
- Look for invitation emails from Supabase
- Contact Supabase support for account recovery
