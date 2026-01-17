# Supabase プロジェクト セットアップガイド

プロジェクトを削除してしまった場合の、新規作成手順です。

## ステップ1: 新しいSupabaseプロジェクトを作成

1. **Supabase にアクセス**
   - https://supabase.com/dashboard にアクセス
   - ログイン（アカウントがない場合は作成）

2. **新しいプロジェクトを作成**
   - 「New Project」をクリック
   - プロジェクト名を入力（例：mbti-diagnosis）
   - データベースパスワードを設定（**必ず保存！**）
   - リージョンを選択（日本なら Tokyo か Singapore が近い）
   - Free プランを選択
   - 「Create new project」をクリック
   - **約2分待つ** - プロジェクトがセットアップされます

3. **API認証情報を取得**
   - プロジェクトが作成されたら、「Project Settings」（歯車アイコン）に移動
   - 左メニューから「API」を選択
   - 以下をコピー：
     - **Project URL** (`https://xxxxx.supabase.co`)
     - **anon public key** (長い文字列)

## ステップ2: .env ファイルを更新

プロジェクトの `.env` ファイルを以下のように更新してください：

```env
VITE_SUPABASE_URL=あなたのProject URL
VITE_SUPABASE_ANON_KEY=あなたのanon public key
```

## ステップ3: データベースマイグレーションを適用

既存のマイグレーションファイルがあるので、Supabase Dashboard から適用します：

1. **SQL Editorを開く**
   - Supabase Dashboard の左メニューから「SQL Editor」を選択

2. **マイグレーションを順番に実行**

   以下のファイルの内容を順番にコピー＆実行してください：

   ① `supabase/migrations/20260116191725_create_diagnosis_history.sql`
   ② `supabase/migrations/20260116193647_create_user_profiles.sql`
   ③ `supabase/migrations/20260116194240_add_user_id_to_diagnosis_history.sql`
   ④ `supabase/migrations/20260117060221_fix_security_issues.sql`

   各ファイルを：
   - 「New query」で新しいクエリタブを開く
   - ファイルの内容を全てコピー＆ペースト
   - 「Run」をクリック
   - エラーがないことを確認
   - 次のファイルへ

## ステップ4: セキュリティ設定（推奨）

セキュリティを強化するため、以下の設定を行ってください：

### 4.1 匿名アクセスを無効化
1. 「Authentication」→「Providers」
2. 「Anonymous Sign-ins」を **OFF** にする
3. Save

### 4.2 漏洩パスワード保護を有効化
1. 「Authentication」→「Policies」
2. 「Check passwords against HaveIBeenPwned」を **有効** にする
3. Save

### 4.3 接続プール設定（オプション - Proプラン以上）
1. 「Project Settings」→「Database」
2. 「Connection Pooling」セクション
3. Auth pool を **Percentage-based (10-15%)** に変更

## ステップ5: Edge Function をデプロイ（オプション）

レポート保存機能が必要な場合：

```bash
# このコマンドは実行しないでください - Dashboard経由で行います
```

現在、Edge Functionのツールが使えないため、必要に応じて後で設定できます。

## ステップ6: 動作確認

1. 開発サーバーが起動している場合は再起動
   ```bash
   npm run dev
   ```

2. アプリにアクセス
3. サインアップして新規ユーザーを作成
4. 診断を実行して、履歴が保存されることを確認

## トラブルシューティング

### エラー: "Invalid API key"
- `.env` ファイルの認証情報を確認
- 開発サーバーを再起動

### エラー: "relation does not exist"
- マイグレーションが正しく実行されているか確認
- SQL Editor で `SELECT * FROM user_profiles;` を実行して確認

### エラー: "permission denied"
- RLSポリシーが正しく設定されているか確認
- マイグレーション④が正しく実行されているか確認

---

## 現在のプロジェクト構成

このアプリには以下のテーブルがあります：

1. **user_profiles** - ユーザープロフィール（名前、生年月日等）
2. **diagnosis_history** - 診断履歴
3. **reports** - 診断レポート（Edge Functionから保存）

すべてのテーブルにRLS（Row Level Security）が適用され、ユーザーは自分のデータのみアクセスできます。

---

**次のステップ**: 上記の手順に従って新しいSupabaseプロジェクトをセットアップしてください。
