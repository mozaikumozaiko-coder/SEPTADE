# Make連携 トラブルシューティング

## 症状：送信してもMakeに届かない

このガイドでは、フロントエンドからMakeにデータが届かない場合の確認手順を説明します。

## 1. ブラウザのコンソールを確認

1. ブラウザで開発者ツールを開く（F12キー）
2. Consoleタブを開く
3. 送信ボタンを押した時に以下のログが表示されるか確認：

```
=== Make送信デバッグ ===
Webhook URL: https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h
Order ID: xxx
📤 Makeにデータを送信中...
送信先URL: https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h
送信データ: {...}
📥 Makeからの応答: {...}
```

### エラーメッセージの意味

| エラー | 原因 | 対処法 |
|--------|------|--------|
| `Webhook URLが設定されていません` | 環境変数が未設定 | `.env`ファイルを確認 |
| `ネットワークエラー` | インターネット接続またはCORSエラー | 接続を確認、Makeの設定を確認 |
| `送信に失敗しました (404)` | Webhook URLが間違っている | `.env`のURLを確認 |
| `送信に失敗しました (500)` | Makeのシナリオでエラー | Makeのシナリオログを確認 |

## 2. 環境変数の確認

`.env`ファイルに以下が設定されているか確認：

```env
VITE_MAKE_WEBHOOK_URL=https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h
```

**注意：**
- 環境変数を変更した場合は、開発サーバーを再起動する必要があります
- 本番環境の場合は、再ビルドとデプロイが必要です

## 3. Makeのシナリオを確認

### 3.1 シナリオが有効になっているか確認

1. [Make.com](https://www.make.com)にログイン
2. 該当のシナリオを開く
3. 画面左下の「ON/OFF」スイッチが「ON」になっているか確認
4. OFFの場合は、ONに切り替える

### 3.2 Webhookモジュールの設定を確認

1. 最初のモジュール（Webhook）をクリック
2. Webhook URLが正しく表示されているか確認
3. URLが`.env`ファイルのものと一致しているか確認

### 3.3 テストデータで確認

Makeのシナリオ画面で「Run once」ボタンを押して、Webhookが待機状態になったら、
以下のコマンドでテストデータを送信してみる：

```bash
curl -X POST https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST123",
    "userId": "test-user-id",
    "tarot": {
      "id": 0,
      "name": "愚者",
      "reading": "新しい始まり",
      "originalName": "The Fool",
      "keywords": ["冒険", "自由"],
      "upright": "新しい始まり",
      "reversed": "無謀"
    },
    "profile": {
      "name": "テスト太郎",
      "gender": "男性",
      "birthday": "1990-01-15"
    },
    "worryText": "テスト",
    "type17": "INTJ",
    "scores": {"E": -20, "S": 15, "T": 30, "J": 25},
    "percents": {"E": 40, "I": 60, "S": 58, "N": 42, "T": 65, "F": 35, "J": 63, "P": 37},
    "fourPillars": {
      "chart": {
        "year": {"天干": "甲", "地支": "子", "蔵干": "癸"},
        "month": {"天干": "丙", "地支": "寅", "蔵干": "甲丙戊"},
        "day": {"天干": "戊", "地支": "午", "蔵干": "丁己"}
      }
    }
  }'
```

このコマンドを実行して、Makeで正しくデータを受信できるか確認してください。

## 4. Makeシナリオの実行ログを確認

1. Makeのシナリオ画面で「History」タブを開く
2. 最近の実行履歴を確認
3. エラーがある場合は、どのモジュールでエラーが発生しているか確認

### よくあるエラー

#### エラー1: GPTモジュールでタイムアウト
- **原因**: プロンプトが長すぎる、またはGPTのAPIキーが無効
- **対処法**:
  - GPT-4のAPIキーが有効か確認
  - タイムアウト設定を延長（60秒程度）

#### エラー2: Supabase Edge Functionへの送信失敗
- **原因**: Edge FunctionのURLが間違っている、またはデプロイされていない
- **対処法**:
  - Edge Functionがデプロイされているか確認
  - URLが正しいか確認：`https://abdawqdcwcwpgqqwabcn.supabase.co/functions/v1/save-report`

## 5. Makeシナリオの正しい構成

シナリオは以下の順序で構成されている必要があります：

```
1. Webhook（Custom Webhook）
   ↓
2. OpenAI > Create a Completion
   - Model: gpt-4o
   - Temperature: 0.7
   - Max Tokens: 4000
   ↓
3. HTTP > Make a Request
   - URL: https://abdawqdcwcwpgqqwabcn.supabase.co/functions/v1/save-report
   - Method: POST
   - Headers: Content-Type: application/json
   - Body:
     {
       "userId": "{{1.userId}}",
       "reportData": {{2.choices[].message.content}}
     }
```

## 6. デバッグのヒント

### フロントエンド側でデータを確認

ブラウザのコンソールに表示される「送信データ」を確認して、
すべてのフィールドが正しく含まれているか確認してください。

特に以下のフィールドは必須です：
- `userId`
- `tarot`
- `profile` (name, gender, birthday)
- `type17`
- `scores`
- `percents`
- `fourPillars`

### Make側でデータを確認

Makeの実行履歴で、Webhookモジュールが受け取ったデータを確認してください。
フロントエンドから送信したデータと一致しているか確認してください。

## 7. よくある質問

### Q: 送信ボタンを押してもエラーメッセージが表示されない

A: ブラウザのコンソールを開いて、エラーメッセージを確認してください。
コンソールに詳細なログが表示されます。

### Q: Makeが200を返すのに「届かない」と表示される

A: 修正済みです。最新版では、Makeが200ステータスコードを返せば、
自動的にレポート生成処理を開始します。

### Q: 何度送信してもレポートが表示されない

A: 以下を確認してください：
1. Makeのシナリオが最後まで実行されているか
2. Supabase Edge Functionが正しくデータを保存しているか
3. `reports`テーブルにデータが保存されているか（Supabaseのダッシュボードで確認）

### Q: Makeのシナリオは実行されているが、Supabaseに保存されない

A: Edge Functionのログを確認してください：
1. Supabaseのダッシュボードを開く
2. 「Edge Functions」→「save-report」→「Logs」を確認
3. エラーメッセージがあれば、その内容を確認

### Q: オーダー番号を送信しても「完全版」にならない

A: 以下の手順で診断してください：

1. **ブラウザのコンソールを確認**
   - 診断を実行してオーダー番号を入力した時点で、以下のログが表示されるか確認：
   ```
   💾 Saving diagnosis history with data: {...}
   ✅ Diagnosis history saved successfully: {...}
   ```
   - 特に`send_user_id`と`order_number`が正しく表示されているか確認

2. **Makeのシナリオログを確認**
   - Makeのシナリオが正常に実行されているか確認
   - HTTP POSTモジュール（Supabaseへの送信）が成功しているか確認
   - Makeが送信しているデータに`userId`と`orderId`が含まれているか確認

3. **Supabase Edge Functionのログを確認**
   - `save-report`関数のログで以下を確認：
   ```
   Existing record check: {...}
   Record exists, updating record ID: xxx
   ```
   - "No existing diagnosis history found" というエラーが出ていないか確認

4. **Makeシナリオの設定を確認**
   - MakeからSupabaseへの送信時に、以下の形式で送信されているか確認：
   ```json
   {
     "userId": "{{webhook受信したuserId}}",
     "orderId": "{{webhook受信したorderId}}",
     "reportData": {{GPTのレスポンス}}
   }
   ```
   - **重要**: `orderId`フィールドが必須です。このフィールドがないと保存されません。

5. **データベースのRLSポリシーを確認**
   - Service roleがdiagnosis_historyテーブルを更新できるポリシーが設定されているか確認
   - 最新のマイグレーション（`add_service_role_update_policy`）が適用されているか確認

## 8. 最近の修正内容（2026-01-19）

以下の問題が修正されました：

1. **Service RoleのUPDATEポリシーを追加**
   - Makeからのレポート保存がRLSポリシーでブロックされていた問題を修正
   - Service roleがdiagnosis_historyテーブルを更新できるようになりました

2. **診断履歴の自動保存**
   - ログイン済みユーザーが診断を完了すると自動的に履歴が保存されるようになりました
   - ログイン後にも自動的に履歴が保存されるようになりました

3. **視覚的なインジケーター追加**
   - GPTレポートが含まれている履歴に「完全版」バッジが表示されるようになりました
   - 履歴リストで完全版と基本版を区別しやすくなりました

4. **詳細なデバッグログ追加**
   - 診断履歴の保存時に詳細なログが表示されるようになりました
   - レポート取得時のデバッグが容易になりました

## 9. サポートが必要な場合

上記の手順で解決しない場合は、以下の情報を提供してください：

1. ブラウザのコンソールログ（エラーメッセージ全体）
2. Makeの実行履歴のスクリーンショット
3. Supabase Edge Functionのログ
4. 送信時の操作手順

これらの情報があれば、問題を特定しやすくなります。
