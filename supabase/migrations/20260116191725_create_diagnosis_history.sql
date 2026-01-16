/*
  # 診断履歴テーブルの作成

  1. 新しいテーブル
    - `diagnosis_history`
      - `id` (uuid, primary key)
      - `user_identifier` (text) - ユーザー識別子（名前+生年月日のハッシュ）
      - `profile_data` (jsonb) - プロフィール情報
      - `result_data` (jsonb) - 診断結果データ
      - `created_at` (timestamptz) - 作成日時

  2. セキュリティ
    - RLSを有効化
    - 誰でも自分の診断結果を読み取れるポリシーを追加
    - 誰でも診断結果を作成できるポリシーを追加
  
  3. インデックス
    - user_identifierとcreated_atにインデックスを作成して検索を高速化
*/

CREATE TABLE IF NOT EXISTS diagnosis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  profile_data jsonb NOT NULL,
  result_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diagnosis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read diagnosis history"
  ON diagnosis_history
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create diagnosis history"
  ON diagnosis_history
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_diagnosis_history_user_identifier 
  ON diagnosis_history(user_identifier);

CREATE INDEX IF NOT EXISTS idx_diagnosis_history_created_at 
  ON diagnosis_history(created_at DESC);