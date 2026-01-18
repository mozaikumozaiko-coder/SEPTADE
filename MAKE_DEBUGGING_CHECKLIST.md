# Make連携デバッグチェックリスト

## 🔍 問題: 「送信してもMakeに届かない」

このチェックリストに従って、問題を特定してください。

---

## ✅ Step 1: テストツールで確認（最優先）

1. ブラウザで `test-make-webhook.html` を開く
2. 「テストデータを送信」ボタンをクリック
3. 結果を確認：

### ✅ 成功した場合
- 「✅ 成功！Makeに正常に送信されました！」と表示される
- → **Makeには届いている** ので、Make側のシナリオ設定を確認（Step 3へ）

### ❌ エラーが出た場合
- エラーメッセージを確認して、該当する項目へ：
  - `404 Not Found` → Step 2-1
  - `403 Forbidden` → Step 2-2
  - `500 Internal Server Error` → Step 2-3
  - `ネットワークエラー` → Step 2-4

---

## 🔧 Step 2: エラー別の対処法

### Step 2-1: 404 Not Found が出る場合

**原因：** Webhook URLが間違っているか、シナリオが削除された

**対処法：**
1. `.env`ファイルのURLを確認：
   ```
   VITE_MAKE_WEBHOOK_URL=https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h
   ```
2. Makeのシナリオを開いて、Webhookモジュールの正しいURLをコピー
3. `.env`ファイルのURLを更新
4. 開発サーバーを再起動：
   ```bash
   # Ctrl+C で停止してから
   npm run dev
   ```

### Step 2-2: 403 Forbidden が出る場合

**原因：** Makeのシナリオが無効（OFF）になっている

**対処法：**
1. [Make.com](https://www.make.com)にログイン
2. 該当のシナリオを開く
3. 画面左下の「ON/OFF」スイッチを確認
4. OFFの場合は、ONに切り替える

### Step 2-3: 500 Internal Server Error が出る場合

**原因：** Makeのシナリオ内でエラーが発生している

**対処法：**
1. Makeのシナリオ画面で「History」タブを開く
2. 最近の実行履歴を確認
3. エラーが出ているモジュールを特定
4. よくあるエラー：
   - **GPTモジュールでエラー**: APIキーが無効、またはクレジットがない
   - **HTTP POST（Supabase）でエラー**: URLが間違っている、またはEdge Functionがデプロイされていない

### Step 2-4: ネットワークエラーが出る場合

**原因：** インターネット接続の問題、またはファイアウォール

**対処法：**
1. インターネット接続を確認
2. ファイアウォールやウイルス対策ソフトが通信をブロックしていないか確認
3. 別のネットワーク（モバイルホットスポットなど）で試す

---

## 🎯 Step 3: Makeのシナリオ設定を確認

### 3-1: シナリオの構成を確認

正しい構成：
```
1. Webhook（Custom Webhook）
   ↓
2. OpenAI > Create a Completion
   ↓
3. HTTP > Make a Request
```

### 3-2: 各モジュールの設定を確認

#### モジュール1: Webhook
- **確認事項なし**（自動設定）

#### モジュール2: OpenAI
- **Model**: `gpt-4o`
- **Temperature**: `0.7`
- **Max Tokens**: `4000` 以上
- **System Message**: `MAKE_INTEGRATION.md`のSystem Promptをコピー
- **User Message**: `MAKE_INTEGRATION.md`のUser Promptをコピー
  - 変数を正しくマッピング（例: `{{1.userId}}`, `{{1.tarot.name}}`など）

#### モジュール3: HTTP POST
- **URL**: `https://abdawqdcwcwpgqqwabcn.supabase.co/functions/v1/save-report`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "userId": "{{1.userId}}",
    "reportData": {{2.choices[].message.content}}
  }
  ```

**重要：** `reportData`の値は`{{2.choices[].message.content}}`のように、
JSONオブジェクトとして直接マッピングしてください（文字列として""で囲まない）

---

## 📊 Step 4: 実行履歴で確認

1. Makeのシナリオ画面で「History」タブを開く
2. 最近の実行を確認：

### ✅ 実行されている場合
- どのモジュールまで成功しているか確認
- エラーが出ているモジュールを特定
- エラーメッセージを確認

### ❌ 実行履歴が空の場合
- Webhookにデータが届いていない
- → Step 1のテストツールで再確認

---

## 🌐 Step 5: フロントエンドから送信する場合

### 5-1: ブラウザのコンソールを開く

1. ブラウザでアプリを開く
2. `F12`キーを押して開発者ツールを開く
3. `Console`タブを選択

### 5-2: 送信ボタンをクリックして確認

オーダー番号を入力して送信ボタンをクリックすると、以下のログが表示されます：

```
=== Make送信デバッグ ===
Webhook URL: https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h
Order ID: xxx
📤 Makeにデータを送信中...
送信先URL: https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h
送信データ: {...}
📥 Makeからの応答: {...}
```

### 5-3: 応答を確認

#### ✅ 正常な場合
```
📥 Makeからの応答: { status: 200, statusText: 'OK', ok: true }
✅ Makeへの送信成功 - データ処理中
```

#### ❌ エラーの場合
```
❌ Makeへの送信失敗: { status: 404, statusText: 'Not Found' }
```

エラーの場合は、Step 2の該当する項目を確認してください。

---

## 🔍 Step 6: Supabaseで確認

Makeが正常に実行されたのに、フロントエンドにレポートが表示されない場合：

### 6-1: reportsテーブルを確認

1. [Supabaseダッシュボード](https://supabase.com/dashboard)を開く
2. プロジェクトを選択
3. 左メニューの「Table Editor」をクリック
4. `reports`テーブルを開く
5. データが保存されているか確認

### 6-2: Edge Functionのログを確認

1. 左メニューの「Edge Functions」をクリック
2. `save-report`を選択
3. 「Logs」タブを開く
4. エラーが出ていないか確認

---

## 📝 よくある原因と解決策まとめ

| 症状 | 原因 | 解決策 |
|------|------|--------|
| テストツールで404エラー | Webhook URLが間違っている | `.env`のURLを確認して修正 |
| テストツールで403エラー | シナリオがOFFになっている | MakeでシナリオをONにする |
| テストツールは成功するがHistoryが空 | シナリオが実行されていない | シナリオをONにして、「Run once」で確認 |
| HistoryにはあるがGPTでエラー | GPT APIキーが無効 | OpenAIのAPIキーを確認 |
| HistoryにはあるがHTTP POSTでエラー | Supabase URLが間違っている | HTTP POSTモジュールのURLを確認 |
| Supabaseには保存されるが表示されない | フロントエンドのポーリング問題 | ブラウザのコンソールでエラーを確認 |

---

## 🆘 それでも解決しない場合

以下の情報を収集して、サポートに連絡してください：

1. **テストツールの結果**（スクリーンショット）
2. **ブラウザのコンソールログ**（すべてコピー）
3. **Makeの実行履歴**（スクリーンショット）
4. **Supabase Edge Functionのログ**（スクリーンショット）
5. **どの手順まで試したか**

これらの情報があれば、問題を特定しやすくなります。
