/*
  # Optimize RLS Performance
  
  ## Performance Improvements
  
  1. **diagnosis_history table**
     - Replace `auth.uid()` with `(SELECT auth.uid())` in all policies
     - This prevents re-evaluation of auth function for each row
     - Significantly improves query performance at scale
  
  ## Changes Made
  
  - Updated SELECT policy: Wrapped auth.uid() in SELECT subquery
  - Updated INSERT policy: Wrapped auth.uid() in SELECT subquery  
  - Updated UPDATE policy: Wrapped auth.uid() in SELECT subquery
  - Updated DELETE policy: Wrapped auth.uid() in SELECT subquery
  
  ## References
  
  - https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
*/

-- ============================================================================
-- OPTIMIZE DIAGNOSIS_HISTORY RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read own diagnosis history" ON diagnosis_history;
DROP POLICY IF EXISTS "Authenticated users can insert own diagnosis history" ON diagnosis_history;
DROP POLICY IF EXISTS "Authenticated users can update own diagnosis history" ON diagnosis_history;
DROP POLICY IF EXISTS "Authenticated users can delete own diagnosis history" ON diagnosis_history;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Authenticated users can read own diagnosis history"
  ON diagnosis_history
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can insert own diagnosis history"
  ON diagnosis_history
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can update own diagnosis history"
  ON diagnosis_history
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can delete own diagnosis history"
  ON diagnosis_history
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
