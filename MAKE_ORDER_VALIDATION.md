# Make オーダー番号検証の実装ガイド

## フロントエンドからMakeへのリクエスト

フロントエンドは以下のJSONをMake Webhookに送信します：

```json
{
  "orderId": "ORD-12345",
  "userId": "user_1234567890_abc123",
  "tarot": {
    "id": 0,
    "name": "旅装の童",
    "reading": "たびよそおいのわらべ",
    "originalName": "愚者",
    "keywords": "無垢・旅立ち・直感・自由",
    "upright": "やってみる価値。未知へ踏み出すと運が動く。",
    "reversed": "無計画・現実逃避。下調べ不足で痛い目。"
  },
  "profile": {
    "name": "山田太郎",
    "gender": "男性",
    "birthday": "1990-01-15"
  },
  "worryText": "キャリアについて悩んでいます",
  "type17": "INTJ",
  "scores": {
    "E": -20,
    "S": 15,
    "T": 30,
    "J": 25
  },
  "percents": {
    "E": 40,
    "I": 60,
    "S": 58,
    "N": 42,
    "T": 65,
    "F": 35,
    "J": 63,
    "P": 37
  },
  "fourPillars": {
    "chart": {
      "year": { "天干": "甲", "地支": "子", "蔵干": "癸" },
      "month": { "天干": "丙", "地支": "寅", "蔵干": "甲丙戊" },
      "day": { "天干": "戊", "地支": "午", "蔵干": "丁己" }
    }
  },
  "diagnosis": {
    "typeName": "建築家",
    "description": "...",
    "strengths": [...],
    "weaknesses": [...],
    "characteristics": [...],
    "compatibility": {
      "goodMatches": [...],
      "badMatches": [...]
    }
  }
}
```

## Makeで実装すべきフロー

### ステップ1: オーダー番号の検証

受け取った`orderId`を使って、あなたのデータベース（Airtable、Google Sheets、Supabaseなど）で注文の存在を確認します。

**検証条件の例：**
- オーダーIDが存在する
- 支払いが完了している
- まだ使用されていない（または再利用可能）
- 有効期限内である

### ステップ2: レスポンスの返却

**オーダーが有効な場合のレスポンス：**
```json
{
  "success": true,
  "orderValid": true,
  "message": "オーダー番号を確認できました"
}
```

**オーダーが無効な場合のレスポンス：**
```json
{
  "success": false,
  "orderValid": false,
  "message": "オーダー番号が見つかりません"
}
```

### ステップ3: GPT分析とSupabase保存

**重要：** オーダーが有効な場合のみ、GPT分析とSupabase保存を行ってください。

1. 上記のレスポンスを返した後
2. GPTで診断レポートを生成
3. Supabase Edge Function (`save-report`) にレポートを保存

## Make シナリオの構成例

```
┌─────────────────────┐
│  Webhook受信        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ オーダー番号検証     │
│ (Airtable/Sheets)   │
└──────────┬──────────┘
           │
           ├─── 有効 ───┐
           │            │
           │            ▼
           │    ┌─────────────────────┐
           │    │ レスポンス返却       │
           │    │ {success: true,     │
           │    │  orderValid: true}  │
           │    └──────────┬──────────┘
           │               │
           │               ▼
           │    ┌─────────────────────┐
           │    │ GPT分析             │
           │    └──────────┬──────────┘
           │               │
           │               ▼
           │    ┌─────────────────────┐
           │    │ Supabase保存        │
           │    └─────────────────────┘
           │
           └─── 無効 ───┐
                        │
                        ▼
                ┌─────────────────────┐
                │ レスポンス返却       │
                │ {success: false,    │
                │  orderValid: false} │
                └─────────────────────┘
```

## Make での設定手順

### モジュール1: Webhook - Custom Webhook
- フロントエンドからのリクエストを受信
- `orderId` を変数として取得

### モジュール2: Router
- オーダー検証の結果に基づいて分岐

### ルート1: オーダー有効
1. **HTTP - Make a request**
   - URL: Webhookのレスポンス先
   - Method: POST
   - Body:
   ```json
   {
     "success": true,
     "orderValid": true,
     "message": "オーダー番号を確認できました"
   }
   ```

2. **OpenAI - Create a Completion**
   - 既存の設定を使用してGPT分析を実行

3. **HTTP - Make a request (Supabase)**
   - 既存の設定を使用してSupabaseに保存

### ルート2: オーダー無効
1. **HTTP - Make a request**
   - URL: Webhookのレスポンス先
   - Method: POST
   - Body:
   ```json
   {
     "success": false,
     "orderValid": false,
     "message": "オーダー番号が見つかりません"
   }
   ```

## 重要な注意事項

1. **レスポンスは必ず返す**
   - オーダーが有効でも無効でも、必ず上記形式のJSONレスポンスを返してください
   - `success` と `orderValid` フィールドは必須です

2. **orderValid フィールドが重要**
   - フロントエンドは `orderValid === true` かつ `success === true` の場合のみレポート待機を開始します
   - それ以外の場合はエラーメッセージを表示します

3. **非同期処理**
   - レスポンスを返した後、GPT分析とSupabase保存は非同期で実行されます
   - フロントエンドは3秒ごとにポーリングしてレポートの完成を待ちます

4. **エラーハンドリング**
   - データベース接続エラーなどの場合は、`orderValid: false` を返してください
   - `message` フィールドでユーザーに適切なメッセージを伝えてください

## テスト方法

1. **有効なオーダー番号でテスト**
   ```
   入力: "ORD-12345"（実際に存在する番号）
   期待結果: "番号を確認できました　そのままお待ちください" というアラート
   → レポートが表示される
   ```

2. **無効なオーダー番号でテスト**
   ```
   入力: "INVALID-999"
   期待結果: "オーダー番号が見つかりません" というエラーメッセージ
   → レポートは表示されない
   ```

3. **空のオーダー番号でテスト**
   ```
   入力: ""（空）
   期待結果: "オーダー番号を入力してください" というエラーメッセージ
   ```
