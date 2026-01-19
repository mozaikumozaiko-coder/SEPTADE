/*
  # Add GPT Report to Diagnosis History

  1. Changes
    - Add `gpt_report_data` column to `diagnosis_history` table to store Make/GPT generated reports
    - This allows displaying GPT reports alongside diagnosis results in history
  
  2. Benefits
    - Unified data model: GPT reports are linked to their corresponding diagnosis
    - Simplifies fetching: No need to query separate tables
    - Better data integrity: Reports are associated with their diagnosis records
*/

-- Add gpt_report_data column to diagnosis_history table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_history' AND column_name = 'gpt_report_data'
  ) THEN
    ALTER TABLE diagnosis_history ADD COLUMN gpt_report_data jsonb DEFAULT NULL;
  END IF;
END $$;

-- Add index for faster queries when filtering by GPT report existence
CREATE INDEX IF NOT EXISTS idx_diagnosis_history_has_gpt_report 
  ON diagnosis_history ((gpt_report_data IS NOT NULL));