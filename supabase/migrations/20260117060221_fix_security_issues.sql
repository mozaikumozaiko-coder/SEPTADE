/*
  # Fix Security and Performance Issues

  ## Changes

  1. **RLS Performance Optimization**
     - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation for each row, significantly improving query performance

  2. **Remove Unused Index**
     - Drop `idx_reports_order_number` as it's not being used
     - Existing `idx_reports_user_id_order_number` provides better coverage

  3. **Fix Function Security**
     - Set `search_path = ''` on `handle_new_user` function
     - Set `search_path = ''` on `update_updated_at_column` function
     - Prevents security vulnerabilities from search_path manipulation

  4. **Fix Reports Table RLS Policies**
     - Replace overly permissive policies with restrictive ones
     - Remove policies with `true` conditions that bypass security
     - Implement proper authentication checks

  ## Security Notes
  
  These changes address critical security and performance issues:
  - RLS policies now evaluate auth functions once per query instead of per row
  - Functions are protected against search_path attacks
  - Reports table now has proper access control
*/

-- ============================================================================
-- 1. FIX RLS PERFORMANCE ISSUES
-- ============================================================================

-- Drop and recreate user_profiles policies with optimized auth checks
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Drop and recreate diagnosis_history policies with optimized auth checks
DROP POLICY IF EXISTS "Authenticated users can read own diagnosis history" ON diagnosis_history;
DROP POLICY IF EXISTS "Authenticated users can insert own diagnosis history" ON diagnosis_history;

CREATE POLICY "Authenticated users can read own diagnosis history"
  ON diagnosis_history
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Authenticated users can insert own diagnosis history"
  ON diagnosis_history
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 2. REMOVE UNUSED INDEX
-- ============================================================================

DROP INDEX IF EXISTS idx_reports_order_number;

-- ============================================================================
-- 3. FIX FUNCTION SECURITY (SEARCH_PATH)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. FIX REPORTS TABLE RLS POLICIES
-- ============================================================================

-- Drop insecure policies that use 'true' conditions
DROP POLICY IF EXISTS "Anyone can read reports" ON reports;
DROP POLICY IF EXISTS "Service role can insert reports" ON reports;
DROP POLICY IF EXISTS "Service role can update reports" ON reports;

-- Create secure policies for reports table
-- Note: Edge functions use service_role key which bypasses RLS,
-- so these policies are for any client-side access

CREATE POLICY "Authenticated users can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "Authenticated users can insert own reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Authenticated users can update own reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);