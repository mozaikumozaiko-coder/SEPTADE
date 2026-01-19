/*
  # Add Service Role Update Policy for Diagnosis History

  1. Changes
    - Add UPDATE policy for service_role to allow Make scenario to update diagnosis history with GPT reports
    - This policy allows the edge function (which uses service_role key) to update records
    
  2. Security
    - Only service_role can use this policy
    - Regular authenticated users still need to match auth.uid() = user_id
    - This is required for the save-report edge function to work
*/

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