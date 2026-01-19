/*
  # Cleanup Duplicate Records and Add Unique Constraint

  1. Changes
    - Delete duplicate diagnosis history records (keep only the most recent one per order_number + send_user_id)
    - Add unique constraint on (order_number, send_user_id) combination
    
  2. Benefits
    - Removes existing duplicate records
    - Prevents future duplicates from being created
    - Ensures data integrity at database level
*/

-- Delete duplicate records, keeping only the most recent one for each order_number + send_user_id combination
DELETE FROM diagnosis_history
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY order_number, send_user_id 
        ORDER BY created_at DESC
      ) as rn
    FROM diagnosis_history
    WHERE order_number IS NOT NULL 
      AND send_user_id IS NOT NULL
  ) AS ranked
  WHERE rn > 1
);

-- Add unique constraint to prevent duplicate order_number + send_user_id combinations
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_order_user 
  ON diagnosis_history (order_number, send_user_id) 
  WHERE order_number IS NOT NULL AND send_user_id IS NOT NULL;
