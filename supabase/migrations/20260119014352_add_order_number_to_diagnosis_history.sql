/*
  # Add Order Number to Diagnosis History

  1. Changes
    - Add `order_number` column to `diagnosis_history` table
    - This allows linking Make webhook responses to their corresponding diagnosis records
  
  2. Benefits
    - Can update the correct diagnosis record when GPT report is received from Make
    - Maintains data consistency between diagnosis and GPT reports
*/

-- Add order_number column to diagnosis_history table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_history' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE diagnosis_history ADD COLUMN order_number text DEFAULT NULL;
  END IF;
END $$;

-- Add index for faster lookups by order_number
CREATE INDEX IF NOT EXISTS idx_diagnosis_history_order_number 
  ON diagnosis_history (order_number) 
  WHERE order_number IS NOT NULL;