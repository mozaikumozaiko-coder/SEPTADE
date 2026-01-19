/*
  # Add send_user_id column to diagnosis_history

  ## Changes
    1. Add `send_user_id` column to `diagnosis_history` table
       - This stores the user ID that was sent to Make webhook
       - Used to retrieve GPT reports from the reports table
    
  ## Purpose
    - Links diagnosis history with GPT reports
    - Enables displaying past reports when viewing diagnosis history
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_history' AND column_name = 'send_user_id'
  ) THEN
    ALTER TABLE diagnosis_history ADD COLUMN send_user_id text;
    CREATE INDEX IF NOT EXISTS idx_diagnosis_history_send_user_id ON diagnosis_history(send_user_id);
  END IF;
END $$;