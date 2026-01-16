/*
  # Add user_id to diagnosis_history table

  1. Changes
    - Add `user_id` column to diagnosis_history table (references auth.users)
    - Update RLS policies to restrict access to authenticated users' own data
    - Add index on user_id for faster queries
  
  2. Security
    - Drop existing overly permissive policies
    - Add policy for authenticated users to read their own history
    - Add policy for authenticated users to insert their own history
  
  3. Notes
    - Existing records without user_id will remain accessible via user_identifier
    - New records will be linked to authenticated users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_history' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE diagnosis_history ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Anyone can read diagnosis history" ON diagnosis_history;
DROP POLICY IF EXISTS "Anyone can create diagnosis history" ON diagnosis_history;

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

CREATE INDEX IF NOT EXISTS idx_diagnosis_history_user_id 
  ON diagnosis_history(user_id, created_at DESC);