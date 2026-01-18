/*
  # Fix Function Search Path Security Issue

  ## Changes
  1. Drop and recreate verify_rls_enabled function with immutable search_path
  2. Set explicit search_path to prevent security vulnerabilities

  ## Security Notes
  - Functions with SECURITY DEFINER must have immutable search_path
  - This prevents malicious users from manipulating the search path
  - Explicitly setting search_path = 'pg_catalog, public' ensures predictable behavior
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS verify_rls_enabled();

-- Recreate with proper security settings
CREATE OR REPLACE FUNCTION verify_rls_enabled()
RETURNS TABLE(
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
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

COMMENT ON FUNCTION verify_rls_enabled IS 'Helper function to verify RLS is enabled and policies exist on all tables. Uses immutable search_path for security.';
