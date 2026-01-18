SEPTADE

## デプロイメント

**Vercelにデプロイする方法**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)を参照してください。

**重要**: bolt.newから直接公開することはできません。Vercel等のホスティングサービスが必要です。

## Supabase認証セットアップ

このアプリケーションはSupabase Authを使用してメール/パスワード認証を実装しています。

### 1. 環境変数の設定

`.env`ファイルに以下の環境変数が既に設定されています：

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabaseダッシュボードでの設定

Supabaseプロジェクトのダッシュボードで以下の設定を行ってください：

#### Email認証の有効化

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左サイドバーから「Authentication」→「Providers」を選択
4. 「Email」プロバイダーを有効化
5. 「Confirm email」を**オフ**に設定（メール確認を無効化）
6. 「Save」をクリック

#### リダイレクトURLの設定

1. 左サイドバーから「Authentication」→「URL Configuration」を選択
2. 「Redirect URLs」に以下を追加：
   - `http://localhost:5173/app`（開発環境用）
   - `https://yourdomain.com/app`（本番環境用）
3. 「Save」をクリック

#### セキュリティ設定（推奨）

1. 左サイドバーから「Authentication」→「Policies」を選択
2. パスワード要件を設定（最低8文字）
3. レート制限を適切に設定

### 3. 認証フロー

- `/login`: ログイン画面
- `/signup`: 新規登録画面
- `/reset`: パスワードリセット画面
- `/app`: 診断アプリ（認証必須）
- `/`: `/app`へリダイレクト

### 4. データベーステーブル

以下のテーブルが自動的に作成されます：

- `user_profiles`: ユーザープロファイル情報
- `diagnosis_history`: 診断履歴
- `reports`: 診断レポート

すべてのテーブルでRow Level Security（RLS）が有効化されており、ユーザーは自分のデータのみアクセス可能です。

## Make Webhook設定

診断結果をMakeに送信する機能を使用するには、`.env`ファイルに以下の環境変数を設定してください：

```
VITE_MAKE_WEBHOOK_URL=https://hook.us1.make.com/your-webhook-url
```

### 送信されるJSON形式

```json
{
  "timestamp": "2026-01-15T00:00:00.000Z",
  "profile": {
    "name": "ユーザー名",
    "gender": "男性/女性/その他",
    "birthdate": "2000-01-01"
  },
  "result": {
    "type": "INTJ",
    "typeName": "タイプ名",
    "description": "診断結果の説明",
    "scores": {
      "E": 75,
      "I": 25,
      "S": 60,
      "N": 40,
      "T": 80,
      "F": 20,
      "J": 70,
      "P": 30
    },
    "strengths": ["強み1", "強み2"],
    "weaknesses": ["弱み1", "弱み2"],
    "characteristics": ["特性1", "特性2"],
    "compatibility": {
      "goodMatches": ["ENFP", "ENTP"],
      "badMatches": ["ESFP", "ESTP"]
    }
  }
}
```
