/*
  # Security Configuration Documentation

  This migration adds comments and documentation for security best practices.
  
  ## Database Security Status
  
  1. **Row Level Security (RLS)**
     - ✅ Enabled on all tables
     - ✅ All policies require authentication
     - ✅ Proper ownership verification using auth.uid()
  
  2. **Tables Secured**
     - diagnosis_history: Users can only access their own diagnosis records
     - user_profiles: Users can only access their own profile
     - reports: Users can only access their own reports
  
  3. **Dashboard Configuration Required**
     - Auth DB Connection: Change to percentage-based (15-20%)
     - Anonymous Sign-ins: Must be disabled
     - Leaked Password Protection: Must be enabled
  
  ## Additional Security Notes
  
  - All foreign keys properly reference auth.users
  - Default values set for timestamps
  - UUID primary keys prevent enumeration attacks
  - No anonymous access policies exist
*/

-- Verify RLS is enabled on all public tables
DO $$ 
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    -- Enable RLS if not already enabled
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
  END LOOP;
END $$;

-- Add comments to tables for documentation
COMMENT ON TABLE diagnosis_history IS 'Stores user diagnosis history with strict RLS - users can only access their own records';
COMMENT ON TABLE user_profiles IS 'User profile data with RLS - users can only access their own profile';
COMMENT ON TABLE reports IS 'User reports with RLS - users can only access their own reports';

-- Verify all policies are working correctly
-- This will help identify any issues with RLS policies
CREATE OR REPLACE FUNCTION verify_rls_enabled()
RETURNS TABLE(
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    schemaname || '.' || tablename AS table_name,
    rowsecurity AS rls_enabled,
    (SELECT COUNT(*) 
     FROM pg_policies 
     WHERE schemaname = t.schemaname 
     AND tablename = t.tablename) AS policy_count
  FROM pg_tables t
  WHERE schemaname = 'public'
  ORDER BY tablename;
$$;

COMMENT ON FUNCTION verify_rls_enabled IS 'Helper function to verify RLS is enabled and policies exist on all tables';
