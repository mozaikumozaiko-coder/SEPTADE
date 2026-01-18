# Vercel デプロイ設定

## 環境変数の設定

Vercelでアプリを正しく動作させるには、以下の環境変数を設定する必要があります。

### 設定手順

1. [Vercel ダッシュボード](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」に移動
4. 以下の環境変数を追加：

```
VITE_SUPABASE_URL=https://abdawqdcwcwpgqqwabcn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZGF3cWRjd2N3cGdxcXdhYmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODEzODIsImV4cCI6MjA4NDA1NzM4Mn0.3UcPd0y6cvAUuW5sxLXifs4evMKG3M3rpsZuOVspuMo
VITE_MAKE_WEBHOOK_URL=https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h
```

5. 環境変数を追加したら、「Production」「Preview」「Development」全てにチェックを入れる
6. プロジェクトを再デプロイ：
   - 「Deployments」タブに移動
   - 最新のデプロイメントの右側にある「...」をクリック
   - 「Redeploy」を選択

## トラブルシューティング

### 画像しか表示されない場合

これは環境変数が設定されていないことが原因です。上記の手順に従って環境変数を設定し、再デプロイしてください。

### 環境変数が反映されない場合

- ブラウザのキャッシュをクリア
- プロジェクトを完全に再デプロイ
- 環境変数の名前が正確であることを確認（`VITE_`プレフィックスが必要）
