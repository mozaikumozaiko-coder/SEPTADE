# デプロイメントガイド

## 重要：bolt.newから直接公開できません！

**bolt.newは開発環境です。** アプリを公開するには、Vercelなどのホスティングサービスにデプロイする必要があります。

## Vercelでのデプロイ方法

### 1. Vercelにプロジェクトをデプロイ

#### GitHubから自動デプロイ（推奨）

1. プロジェクトをGitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)にログイン
3. 「New Project」をクリック
4. GitHubリポジトリを選択
5. 「Import」をクリック

#### 手動デプロイ

```bash
npm install -g vercel
vercel login
vercel
```

### 2. 環境変数の設定（重要！）

Vercelダッシュボードで以下の環境変数を設定：

1. [Vercel ダッシュボード](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」に移動
4. 以下を追加：

```
VITE_SUPABASE_URL=https://abdawqdcwcwpgqqwabcn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZGF3cWRjd2N3cGdxcXdhYmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODEzODIsImV4cCI6MjA4NDA1NzM4Mn0.3UcPd0y6cvAUuW5sxLXifs4evMKG3M3rpsZuOVspuMo
VITE_MAKE_WEBHOOK_URL=https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h
```

5. 「Production」「Preview」「Development」全てにチェック
6. 「Save」をクリック

### 3. 再デプロイ

環境変数を追加したら、**必ず再デプロイ**してください：

1. 「Deployments」タブに移動
2. 最新のデプロイメントの右側「...」をクリック
3. 「Redeploy」を選択
4. 「Redeploy」を再度クリックして確認

## bolt.newからの公開について

**bolt.newから直接公開することはできません。**

理由：
- bolt.newは開発環境です
- 本番環境へのデプロイにはVercel、Netlify、Cloudflareなどのホスティングサービスが必要
- 環境変数の管理やセキュリティのため、専用のホスティングサービスを使用する必要があります

## トラブルシューティング

### ログイン画面が表示されない（最も多い問題）

**原因**: 環境変数が設定されていない

**解決方法**:
1. **必ず環境変数を設定してください**（上記の3つすべて）
2. 環境変数を「Production」「Preview」「Development」すべてにチェック
3. **再デプロイを必ず実行**（環境変数を追加しただけでは反映されません）
4. ブラウザのキャッシュをクリア（Ctrl+Shift+R または Cmd+Shift+R）
5. 5分待ってから再度アクセス

**重要**: 環境変数を追加した後、再デプロイしないと反映されません！

### 画面が白紙または画像のみ表示

**原因**: 環境変数が未設定

**解決方法**:
1. 上記の環境変数を設定
2. 必ず再デプロイを実行
3. ブラウザのキャッシュをクリア（Ctrl+Shift+DelまたはCmd+Shift+Delete）

### 404エラーが表示される

**原因**: SPAルーティングの設定不足

**解決方法**:
- `vercel.json`に以下の設定があることを確認：
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### ビルドエラー

**原因**: 依存関係の問題

**解決方法**:
```bash
npm install
npm run build
```

## 確認事項チェックリスト

デプロイ前に確認：

- [ ] GitHubリポジトリにプッシュ済み
- [ ] Vercelプロジェクトが作成済み
- [ ] 環境変数を3つとも設定済み
- [ ] 環境変数をProduction, Preview, Developmentに適用済み
- [ ] 再デプロイを実行済み
- [ ] ブラウザのキャッシュをクリア済み

## サポート

問題が解決しない場合：
1. Vercelのデプロイログを確認
2. ブラウザの開発者ツール（F12）でコンソールエラーを確認
3. 環境変数が正しく読み込まれているか確認：
   - 開発者ツールのConsoleタブで `import.meta.env` を入力して実行
