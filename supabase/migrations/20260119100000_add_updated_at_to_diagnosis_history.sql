/*
  # Add updated_at column to diagnosis_history

  1. Changes
    - Add `updated_at` column to `diagnosis_history` table
    - Set default value to now() for existing records
    - Create trigger to automatically update `updated_at` on record updates
    - Add UPDATE policy for service role

  2. Purpose
    - Track when GPT report data is added/updated
    - Enable polling to detect new reports by filtering on updated_at
*/

-- Add updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_history' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE diagnosis_history ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_diagnosis_history_updated_at ON diagnosis_history;
CREATE TRIGGER update_diagnosis_history_updated_at
  BEFORE UPDATE ON diagnosis_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add UPDATE policy for service role (Make uses this to save GPT reports)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'diagnosis_history' AND policyname = 'Service role can update diagnosis history'
  ) THEN
    CREATE POLICY "Service role can update diagnosis history"
      ON diagnosis_history
      FOR UPDATE
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Add index on updated_at for faster polling queries
CREATE INDEX IF NOT EXISTS idx_diagnosis_history_updated_at 
  ON diagnosis_history(updated_at DESC);
