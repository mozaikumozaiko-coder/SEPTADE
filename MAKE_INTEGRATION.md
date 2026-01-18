# Make Integration Guide

## データフロー

1. **フロントエンド → Make Webhook**
   - URL: `https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h`
   - フロントエンドから診断データが送信されます

2. **Make → GPT分析**
   - Makeで受け取ったデータをGPTで分析
   - GPTがレポートJSONを生成

3. **Make → Supabase Edge Function (save-report)**
   - URL: `https://abdawqdcwcwpgqqwabcn.supabase.co/functions/v1/save-report`
   - GPTが生成したレポートをSupabaseに保存

4. **フロントエンド → Supabase**
   - 3秒ごとにポーリングして結果を取得

## Step 1: フロントエンドからMakeが受け取るJSON

フロントエンドからWebhookで以下の形式のデータが送信されます：

```json
{
  "orderId": "0553350408",
  "userId": "user_1234567890_abc123",
  "tarot": {
    "id": 0,
    "name": "愚者",
    "reading": "新しい始まり",
    "originalName": "The Fool",
    "keywords": ["自由", "冒険", "純粋"],
    "upright": "新しい可能性",
    "reversed": "無計画"
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
  }
}
```

**重要:**
- `orderId`は各診断を一意に識別するIDです（オーダー番号など）
- このIDを使用して、同じユーザーの異なる診断を区別します

## Step 2: MakeでGPTに送信するプロンプト

上記データを元に、GPTに以下のようなプロンプトで分析を依頼します：

**System Prompt:**
```
あなたは「性格診断×タロット×四柱推命レポートJSON」を生成するエンジンです。必ず次を守ってください。

【最重要】
- 出力はJSONのみ（前後に説明文・コードフェンス・注釈は禁止）
- 指定された件数を厳守（charts/itemsの数は固定）
- 文字数上限を厳守（超えない）
- valueは0〜100の整数
- 日本語で、読みやすく、具体的で、断定しすぎず、行動提案を含める
- 同じ表現の連発を避ける（語彙の重複を減らす）
- 個人情報や医療/法律/投資の断定助言は禁止（一般的助言に留める）
- 四柱推命は「傾向の読み解き」に留め、吉凶断定・未来の断言は避ける

【出力JSONスキーマ】
{
  "tarotExplanation": "",
  "astrology": "",
  "section1": { "content": "..." },
  "section2": {
    "content": "...",
    "charts": [
      { "title": "...", "value": 0, "desc": "..." }
    ],
    "items": [
      { "title": "...", "desc": "..." }
    ]
  },
  "section3": {
    "content": "...",
    "charts": [
      { "title": "...", "value": 0, "desc": "..." }
    ],
    "items": [
      { "title": "...", "desc": "..." }
    ]
  },
  "fourPillars": {
    "chart": { ... },
    "basic": "...",
    "charts": [
      { "title": "木", "value": 0, "desc": "..." }
    ],
    "itemsA": [
      { "title": "...", "desc": "..." }
    ],
    "itemsB": [
      { "title": "...", "desc": "..." }
    ],
    "itemsC": [
      { "title": "...", "desc": "..." }
    ]
  },
  "section4": {
    "content": "...",
    "charts": [
      { "title": "...", "value": 0, "desc": "..." }
    ],
    "items": [
      { "title": "...", "desc": "..." }
    ]
  }
}

【文字数ルール】
- tarotExplanation：500文字以内
- astrology：590〜600文字以内
- section1.content：400文字以内
- section2.content：400文字以内
- section2.charts：4項目。各 { titleは12文字以内, valueは整数, descは200〜300文字 }
- section2.items：24項目。各 { titleは12文字以内, descは80文字以内 }
- section3.content：400文字以内
- section3.charts：4項目。各 { titleは12文字以内, valueは整数, descは150文字以内 }
- section3.items：24項目。各 { titleは12文字以内, descは150文字以内 }
- fourPillars.basic：400文字以内
- fourPillars.charts：5項目固定（木火土金水）。各 { titleは2文字以内, valueは0〜100整数, descは100〜150文字 }
- fourPillars.itemsA/B/C：各6項目固定。各 { titleは12文字以内, descは80文字以内 }
- section4.content：400文字以内
- section4.charts：4項目。各 { titleは12文字以内, valueは整数, descは200文字以内 }
- section4.items：18項目。各 { titleは12文字以内, descは200文字以内 }
```

**User Prompt:**
```
【入力データ】
tarot: 愚者
userId: user_1234567890_abc123
name: 山田太郎
gender: 男性
birthday: 1990-01-15
worryText: キャリアについて悩んでいます
type17: INTJ
scores: {"E":-20,"S":15,"T":30,"J":25}
percents: {"E":40,"I":60,"S":58,"N":42,"T":65,"F":35,"J":63,"P":37}
fourPillarsChart: {"year":{"天干":"甲","地支":"子","蔵干":"癸"},"month":{"天干":"丙","地支":"寅","蔵干":"甲丙戊"},"day":{"天干":"戊","地支":"午","蔵干":"丁己"}}

それでは、上記スキーマに厳密に従ってJSONのみを出力してください。
```

## Step 3: MakeがSupabase Edge Functionに送信するJSON

GPTからレスポンスを受け取ったら、以下の形式でSupabaseに保存します：

**送信先URL:** `https://abdawqdcwcwpgqqwabcn.supabase.co/functions/v1/save-report`

**HTTPメソッド:** POST

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "userId": "user_1234567890_abc123",
  "orderId": "0553350408",
  "reportData": {
    // GPTから返ってきたJSON全体をここに入れる
  }
}
```

**重要:**
- `orderId`は必須です。これにより同じユーザーの異なる診断を区別できます。
- `orderId`はフロントエンドから送られてきた値をそのまま使用してください。
- `orderId`がない場合、同じユーザーのレポートが上書きされてしまいます。

## GPTが返すべきJSON形式の例

```json
{
  "tarotExplanation": "愚者のカードは新しい始まりを象徴しています...",
  "astrology": "あなたの星座配置から、創造性と分析力が調和した性質が読み取れます...",
  "section1": {
    "content": "あなたの本質的な性格は、論理的思考と独立心が強く..."
  },
  "section2": {
    "content": "キャリアパスについて、戦略的思考と長期的視点が強みです...",
    "charts": [
      { "title": "リーダーシップ", "value": 75, "desc": "組織を率いる力があります..." },
      { "title": "分析力", "value": 85, "desc": "複雑な問題を分解して..." },
      { "title": "創造性", "value": 70, "desc": "新しいアイデアを..." },
      { "title": "実行力", "value": 80, "desc": "計画を着実に..." }
    ],
    "items": [
      { "title": "戦略思考", "desc": "長期的視点で計画を立てる力" },
      { "title": "問題解決", "desc": "論理的にアプローチする" }
    ]
  },
  "section3": {
    "content": "成長可能性について、適応力と学習意欲が高いです...",
    "charts": [
      { "title": "適応力", "value": 80, "desc": "新しい環境に素早く対応できる" },
      { "title": "学習意欲", "value": 90, "desc": "知識を吸収する力が高い" },
      { "title": "柔軟性", "value": 75, "desc": "状況に応じて対応を変える" },
      { "title": "回復力", "value": 70, "desc": "困難から立ち直る力" }
    ],
    "items": [
      { "title": "感情表現", "desc": "自分の気持ちを言葉にする練習" },
      { "title": "共感力", "desc": "相手の立場で考える" }
    ]
  },
  "fourPillars": {
    "chart": {
      "year": { "天干": "甲", "地支": "子", "蔵干": "癸" },
      "month": { "天干": "丙", "地支": "寅", "蔵干": "甲丙戊" },
      "day": { "天干": "戊", "地支": "午", "蔵干": "丁己" }
    },
    "basic": "命式から読み解くと、木と火の要素が強く、創造性と行動力に恵まれています...",
    "charts": [
      { "title": "木", "value": 65, "desc": "木の要素が示す成長力と柔軟性があります" },
      { "title": "火", "value": 70, "desc": "火の要素による情熱と行動力が強い" },
      { "title": "土", "value": 55, "desc": "土の要素で安定性を保つ力" },
      { "title": "金", "value": 45, "desc": "金の要素による決断力" },
      { "title": "水", "value": 60, "desc": "水の要素で知恵と適応力" }
    ],
    "itemsA": [
      { "title": "性格傾向", "desc": "慎重で計画的に物事を進める" },
      { "title": "思考パターン", "desc": "論理的で分析的な思考" },
      { "title": "行動特性", "desc": "目標に向かって着実に進む" },
      { "title": "価値観", "desc": "効率と成果を重視する" },
      { "title": "意思決定", "desc": "データに基づいて判断する" },
      { "title": "学習スタイル", "desc": "体系的に知識を習得する" }
    ],
    "itemsB": [
      { "title": "人間関係", "desc": "深い絆を大切にする" },
      { "title": "コミュニケーション", "desc": "明確で論理的な伝え方" },
      { "title": "チームワーク", "desc": "役割分担を明確にする" },
      { "title": "リーダーシップ", "desc": "戦略的に組織を導く" },
      { "title": "対人スキル", "desc": "信頼関係を築く力" },
      { "title": "協力姿勢", "desc": "目標達成のために協力する" }
    ],
    "itemsC": [
      { "title": "運気の流れ", "desc": "今年は新しい挑戦の年" },
      { "title": "適した時期", "desc": "春から夏にかけて行動" },
      { "title": "注意点", "desc": "焦らず着実に進める" },
      { "title": "開運行動", "desc": "学びと実践のバランス" },
      { "title": "避けるべき", "desc": "衝動的な決断" },
      { "title": "心がけ", "desc": "柔軟性を持つこと" }
    ]
  },
  "section4": {
    "content": "対人関係について、論理的なコミュニケーションが得意です...",
    "charts": [
      { "title": "共感力", "value": 70, "desc": "相手の気持ちを理解しようと努力する姿勢があります" },
      { "title": "傾聴力", "value": 75, "desc": "相手の話を注意深く聞く力" },
      { "title": "表現力", "value": 80, "desc": "自分の考えを明確に伝える" },
      { "title": "協調性", "value": 72, "desc": "チームで協力する姿勢" }
    ],
    "items": [
      { "title": "傾聴スキル", "desc": "相手の話を最後まで聞き、理解を深める努力をしましょう" },
      { "title": "感情の共有", "desc": "自分の感情を適切に表現する練習を" }
    ]
  }
}
```

## Edge Functionが返すレスポンス

```json
{
  "success": true,
  "message": "Report saved successfully"
}
```

エラーの場合：
```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

## Makeでの設定手順

### モジュール1: Webhook受信
- フロントエンドからのデータを受信
- Webhook URL: `https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h`

### モジュール2: OpenAI - Create a Completion
- Model: `gpt-4o`
- Temperature: `0.7`
- Max Tokens: `4000`
- System Message: 上記の「System Prompt」を設定
- User Message: 上記の「User Prompt」を設定（Webhook受信データを変数として埋め込む）

### モジュール3: HTTP POST - Supabaseに保存
- URL: `https://abdawqdcwcwpgqqwabcn.supabase.co/functions/v1/save-report`
- Method: POST
- Headers:
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "userId": "{{webhook受信したuserId}}",
    "orderId": "{{webhook受信したorderId}}",
    "reportData": {{GPTのレスポンス}}
  }
  ```

**重要:** `orderId`は必ずwebhookから受信した値をそのまま使用してください。

### モジュール4: レスポンス確認
- `success: true` が返ってくればSupabaseへの保存成功
- エラーの場合は `success: false` と `error` フィールドにメッセージが含まれる

## 重要な注意事項

1. **orderId は必須**
   - フロントエンドから送られてきた `orderId` を必ずSupabaseに送信してください
   - この値により、同じユーザーの異なる診断を区別します
   - `orderId`がないと、同じユーザーのレポートが上書きされてしまいます

2. **userId は必須**
   - フロントエンドから送られてきた `userId` をそのまま使用してください
   - この値がSupabaseでのキーになります

3. **GPTレスポンスの処理**
   - GPTが返すJSONは、そのまま `reportData` として送信してください
   - コードフェンス（```json```）が含まれている場合は削除してください
   - 純粋なJSONオブジェクトのみを送信してください

4. **データの保存ロジック**
   - 同じ `userId` と `orderId` の組み合わせで送信された場合、データは更新されます
   - 新しい `orderId` の場合は、新しいレコードとして保存されます
   - これにより、1人のユーザーが複数の診断結果を保持できます

5. **フロントエンドのポーリング**
   - フロントエンドは3秒ごとにSupabaseをポーリングして結果を取得しています
   - Makeでの処理が完了すれば、自動的にフロントエンドに表示されます

6. **タイムアウト**
   - GPTの処理に時間がかかる場合がありますが、Makeは自動的にリトライします
   - 通常10〜30秒程度で完了します
