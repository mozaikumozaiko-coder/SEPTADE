SEPTADE

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
