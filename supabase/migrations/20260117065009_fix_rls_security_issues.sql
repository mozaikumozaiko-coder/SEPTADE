/*
  # Fix Critical Security Issues
  
  ## Security Fixes
  
  1. **Remove Anonymous Access Policies**
     - Drop policies that allow unrestricted anonymous (anon) access
     - Remove `WITH CHECK (true)` policies that bypass RLS
     - Remove `USING (true)` policies that allow unrestricted reads
  
  2. **Implement Proper Authentication**
     - Require authentication for all data access
     - Enforce user ownership checks
     - Use `auth.uid()` to verify user identity
  
  3. **Diagnosis History Table**
     - Only authenticated users can insert their own records
     - Only authenticated users can read their own records
     - Verify user_id matches authenticated user
  
  ## Important Notes
  
  - All tables now require authentication
  - Users can only access their own data
  - Anonymous access is completely removed
  - This addresses the "RLS Policy Always True" security issue
  - This addresses the "Anonymous Access Policies" warnings
*/

-- ============================================================================
-- FIX DIAGNOSIS_HISTORY TABLE SECURITY
-- ============================================================================

-- Drop all insecure anonymous access policies
DROP POLICY IF EXISTS "Anyone can read diagnosis history" ON diagnosis_history;
DROP POLICY IF EXISTS "Anyone can create diagnosis history" ON diagnosis_history;

-- Drop any existing authenticated policies to recreate them properly
DROP POLICY IF EXISTS "Authenticated users can read own diagnosis history" ON diagnosis_history;
DROP POLICY IF EXISTS "Authenticated users can insert own diagnosis history" ON diagnosis_history;

-- Create secure policies that require authentication and ownership
CREATE POLICY "Authenticated users can read own diagnosis history"
  ON diagnosis_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own diagnosis history"
  ON diagnosis_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own diagnosis history"
  ON diagnosis_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own diagnosis history"
  ON diagnosis_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
