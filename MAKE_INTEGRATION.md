# Make Integration Guide

## データフロー

1. **フロントエンド → Make Webhook**
   - URL: `https://hook.eu2.make.com/7ac62r32ffup0cl0d1kr9h3dpbf8dz3h`
   - フロントエンドから診断データが送信されます

2. **Make → GPT分析**
   - Makeで受け取ったデータをGPTで分析

3. **Make → Supabase Edge Function**
   - URL: `https://abdawqdcwcwpgqqwabcn.supabase.co/functions/v1/generate-report`
   - 生成されたレポートをSupabaseに保存

4. **フロントエンド → Supabase**
   - 3秒ごとにポーリングして結果を取得

## MakeがEdge Functionに送信すべきJSON形式

```json
{
  "userId": "user_1234567890_abc123",
  "tarot": "愚者",
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
      "day": { "天干": "戊", "地支": "午", "蔵干": "丁己" },
      "hour": { "天干": "壬", "地支": "戌", "蔵干": "戊辛丁" }
    }
  }
}
```

## Edge Functionが返すレスポンス

```json
{
  "success": true,
  "data": {
    "tarotExplanation": "愚者のカードは...",
    "astrology": "あなたの星座配置から...",
    "section1": {
      "content": "あなたの本質的な性格..."
    },
    "section2": {
      "content": "キャリアパスについて...",
      "charts": [
        { "title": "リーダーシップ", "value": 75, "desc": "組織を率いる..." }
      ],
      "items": [
        { "title": "戦略思考", "desc": "長期的視点で..." }
      ]
    },
    "section3": {
      "content": "成長可能性について...",
      "charts": [
        { "title": "適応力", "value": 80, "desc": "新しい環境に..." }
      ],
      "items": [
        { "title": "感情表現", "desc": "自分の気持ちを..." }
      ]
    },
    "fourPillars": {
      "chart": {
        "year": { "天干": "甲", "地支": "子", "蔵干": "癸" },
        "month": { "天干": "丙", "地支": "寅", "蔵干": "甲丙戊" },
        "day": { "天干": "戊", "地支": "午", "蔵干": "丁己" },
        "hour": { "天干": "壬", "地支": "戌", "蔵干": "戊辛丁" }
      },
      "basic": "命式から読み解く...",
      "charts": [
        { "title": "木", "value": 65, "desc": "木の要素が..." },
        { "title": "火", "value": 70, "desc": "火の要素が..." },
        { "title": "土", "value": 55, "desc": "土の要素が..." },
        { "title": "金", "value": 45, "desc": "金の要素が..." },
        { "title": "水", "value": 60, "desc": "水の要素が..." }
      ],
      "itemsA": [
        { "title": "性格傾向", "desc": "慎重で計画的..." }
      ],
      "itemsB": [
        { "title": "人間関係", "desc": "深い絆を..." }
      ],
      "itemsC": [
        { "title": "運気の流れ", "desc": "今年は..." }
      ]
    },
    "section4": {
      "content": "対人関係について...",
      "charts": [
        { "title": "共感力", "value": 70, "desc": "相手の気持ちを..." }
      ],
      "items": [
        { "title": "傾聴スキル", "desc": "相手の話を..." }
      ]
    }
  }
}
```

## Makeでの設定手順

1. **Webhook受信モジュール**
   - フロントエンドからのデータを受信

2. **HTTP POST モジュール**
   - URL: `https://abdawqdcwcwpgqqwabcn.supabase.co/functions/v1/generate-report`
   - Method: POST
   - Headers:
     - `Content-Type: application/json`
   - Body: 上記のJSON形式でデータを送信

3. **レスポンス確認**
   - `success: true` が返ってくればSupabaseへの保存成功
   - エラーの場合は `error` フィールドにメッセージが含まれる

## 注意事項

- `userId` は必須（フロントエンドから送られてきた値をそのまま使用）
- Edge Functionは自動的にSupabaseの`reports`テーブルにデータを保存します
- 同じ`userId`で複数回送信された場合、データは上書きされます（upsert）
- フロントエンドは3秒ごとにポーリングして結果を取得しています
