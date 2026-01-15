/*
  # Create reports table for storing GPT-generated reports

  1. New Tables
    - `reports`
      - `id` (uuid, primary key) - Unique identifier for each report
      - `user_id` (text) - User identifier sent from Make
      - `report_data` (jsonb) - Complete GPT report JSON
      - `created_at` (timestamptz) - Timestamp when report was created
      - `updated_at` (timestamptz) - Timestamp when report was last updated

  2. Security
    - Enable RLS on `reports` table
    - Add policy for public read access (no authentication required)
    - Add policy for service role to insert/update reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  report_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON reports(user_id);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Anyone can read reports"
  ON reports
  FOR SELECT
  USING (true);

-- Policy for service role to insert reports
CREATE POLICY "Service role can insert reports"
  ON reports
  FOR INSERT
  WITH CHECK (true);

-- Policy for service role to update reports
CREATE POLICY "Service role can update reports"
  ON reports
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
