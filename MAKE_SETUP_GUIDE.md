# Make.com 統合セットアップガイド

## 概要
このガイドでは、診断アプリとMake.comを統合し、GPTによる詳細レポート生成フローを構築する手順を説明します。

## 前提条件
- Make.comアカウント
- OpenAI APIキー
- Supabaseプロジェクト（既に設定済み）

---

## 1. Makeシナリオの作成

### ステップ1: 新しいシナリオを作成
1. Make.comにログイン
2. 「Create a new scenario」をクリック
3. シナリオ名を設定（例：`Fortune Diagnosis Flow`）

---

## 2. モジュール設定

### モジュール1: Webhook（データ受信）

**モジュール選択：** Webhooks > Custom webhook

**設定：**
- Webhook名：`Fortune Diagnosis Webhook`
- 「Add」をクリックして新しいWebhookを作成
- 生成されたWebhook URLをコピー
  - 例：`https://hook.eu2.make.com/xxxxxxxxxxxxx`

**重要：** このURLを `.env` ファイルの `VITE_MAKE_WEBHOOK_URL` に設定してください

---

### モジュール2: OpenAI（GPT分析）

**モジュール選択：** OpenAI > Create a Completion (GPT-4o)

**接続設定：**
- OpenAIアカウントと接続

**設定：**
- **Model**: `gpt-4o`
- **Role**: System
- **System Message**:

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

- **Role**: User
- **User Message**:

```
【入力データ】
タロットカード: {{1.tarot.name}} - {{1.tarot.meaning}}
ユーザーID: {{1.userId}}
名前: {{1.profile.name}}
性別: {{1.profile.gender}}
生年月日: {{1.profile.birthday}}
悩み: {{1.worryText}}
性格タイプ: {{1.type17}} - {{1.diagnosis.typeName}}
説明: {{1.diagnosis.description}}
強み: {{1.diagnosis.strengths}}
弱み: {{1.diagnosis.weaknesses}}
特性: {{1.diagnosis.characteristics}}
スコア（E/I）: {{1.percents.E}}% / {{1.percents.I}}%
スコア（S/N）: {{1.percents.S}}% / {{1.percents.N}}%
スコア（T/F）: {{1.percents.T}}% / {{1.percents.F}}%
スコア（J/P）: {{1.percents.J}}% / {{1.percents.P}}%
四柱推命:
  年柱: {{1.fourPillars.chart.year.天干}}{{1.fourPillars.chart.year.地支}}
  月柱: {{1.fourPillars.chart.month.天干}}{{1.fourPillars.chart.month.地支}}
  日柱: {{1.fourPillars.chart.day.天干}}{{1.fourPillars.chart.day.地支}}
  時柱: {{1.fourPillars.chart.hour.天干}}{{1.fourPillars.chart.hour.地支}}

それでは、上記スキーマに厳密に従ってJSONのみを出力してください。
```

- **Temperature**: `0.7`
- **Max Tokens**: `4000`

---

### モジュール3: テキストパーサー（コードフェンス削除1）

**モジュール選択：** Text parser > Replace

**設定：**
- **Text**: `{{2.choices[].message.content}}`
- **Pattern**: `` ```json ``
- **Replace with**: （空欄）
- **Global match**: ON

---

### モジュール4: テキストパーサー（コードフェンス削除2）

**モジュール選択：** Text parser > Replace

**設定：**
- **Text**: `{{3.text}}`
- **Pattern**: `` ``` ``
- **Replace with**: （空欄）
- **Global match**: ON

---

### モジュール5: HTTP Request（Supabaseへ保存）

**モジュール選択：** HTTP > Make a request

**設定：**
- **URL**: `https://abdawqdcwcwpgqqwabcn.supabase.co/functions/v1/save-report`
- **Method**: `POST`
- **Headers**:
  - Name: `Content-Type`
  - Value: `application/json`

**Body（Type: Raw）**:
```json
{
  "userId": "{{1.userId}}",
  "reportData": {{4.text}}
}
```

**重要：** `reportData`の値は `{{4.text}}` として、クォートで囲まないでください（既にJSON文字列のため）

---

## 3. テスト方法

### Webhookのテスト

1. モジュール1（Webhook）を右クリック → 「Run this module only」
2. Webhookが待機状態になります
3. 以下のテストデータをWebhook URLにPOSTします：

```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
  "tarot": {
    "id": 1,
    "name": "魔術師",
    "meaning": "創造力、行動力、スキル"
  },
  "userId": "user_test_123",
  "profile": {
    "name": "テスト太郎",
    "gender": "男性",
    "birthday": "1990-05-15"
  },
  "worryText": "自分の将来のキャリアについて悩んでいます",
  "type17": "ENTJ",
  "scores": {
    "E": 45,
    "S": -20,
    "T": 60,
    "J": 35
  },
  "percents": {
    "E": 73,
    "I": 27,
    "S": 40,
    "N": 60,
    "T": 80,
    "F": 20,
    "J": 68,
    "P": 32
  },
  "fourPillars": {
    "chart": {
      "year": {
        "天干": "庚",
        "地支": "午",
        "蔵干": "丁己"
      },
      "month": {
        "天干": "辛",
        "地支": "巳",
        "蔵干": "丙庚戊"
      },
      "day": {
        "天干": "癸",
        "地支": "酉",
        "蔵干": "辛"
      },
      "hour": {
        "天干": "不明",
        "地支": "不明",
        "蔵干": "不明"
      }
    }
  },
  "diagnosis": {
    "typeName": "指揮官",
    "description": "生まれながらのリーダーであり、カリスマ性と自信を備えています。",
    "strengths": [
      "強いリーダーシップ",
      "戦略的思考",
      "決断力がある"
    ],
    "weaknesses": [
      "支配的になりやすい",
      "他者の感情を軽視しがち",
      "完璧主義的"
    ],
    "characteristics": [
      "リーダー気質",
      "目標志向",
      "論理的思考",
      "行動力がある"
    ],
    "compatibility": {
      "goodMatches": ["INTJ", "ENTP", "ENFP", "ISTP", "ESTP"],
      "badMatches": ["ISFJ", "ESFJ", "ISFP"]
    }
  }
}'
```

4. Makeでデータが受信されたことを確認
5. 各モジュールの出力を確認

### フルフロー テスト

1. シナリオを有効化（左下のトグルをON）
2. フロントエンドで診断を完了
3. 結果画面に到達すると自動的にMakeに送信されます
4. Makeの実行履歴で処理を確認
5. 10〜30秒後、フロントエンドでGPTレポートが表示されます

---

## 4. トラブルシューティング

### データが送信されない
- `.env`ファイルの`VITE_MAKE_WEBHOOK_URL`が正しく設定されているか確認
- ブラウザのコンソールでエラーを確認

### GPTのレスポンスがJSONでない
- System Messageが正しく設定されているか確認
- Temperatureが0.7に設定されているか確認

### Supabaseへの保存が失敗する
- Edge Function `save-report` がデプロイされているか確認
- Supabaseの`reports`テーブルが作成されているか確認

---

## 5. データフロー図

```
フロントエンド (診断完了)
  ↓ POST (診断データ)
Make Webhook
  ↓
OpenAI GPT-4o (レポート生成)
  ↓
テキストパーサー (クリーンアップ)
  ↓
Supabase Edge Function (save-report)
  ↓
Supabase Database (reports テーブル)
  ↓ ポーリング (3秒ごと)
フロントエンド (レポート表示)
```

---

## 付録: 受信データ構造

Makeが受信するデータの完全な構造：

```typescript
{
  tarot: {
    id: number;          // タロットカードID (0-21)
    name: string;        // カード名（例：「魔術師」）
    meaning: string;     // カードの意味
  };
  userId: string;        // ユーザー固有ID
  profile: {
    name: string;        // 名前
    gender: string;      // 性別
    birthday: string;    // 生年月日 (YYYY-MM-DD)
  };
  worryText: string;     // ユーザーの悩み
  type17: string;        // 17タイプ (例: "ENTJ")
  scores: {              // 生スコア (-100 ~ 100)
    E: number;
    S: number;
    T: number;
    J: number;
  };
  percents: {            // パーセント表示 (0 ~ 100)
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  fourPillars: {         // 四柱推命
    chart: {
      year: { 天干: string; 地支: string; 蔵干: string };
      month: { 天干: string; 地支: string; 蔵干: string };
      day: { 天干: string; 地支: string; 蔵干: string };
      hour: { 天干: string; 地支: string; 蔵干: string };
    };
  };
  diagnosis: {           // 診断結果詳細
    typeName: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    characteristics: string[];
    compatibility: {
      goodMatches: string[];
      badMatches: string[];
    };
  };
}
```
