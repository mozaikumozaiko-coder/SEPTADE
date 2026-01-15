const testData = {
  "tarot": {
    "id": 1,
    "name": "魔術師",
    "meaning": "創造力、行動力、スキル"
  },
  "userId": "user_1736953200000_abc123",
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
};

console.log('=== Make Webhook Test Data ===\n');
console.log(JSON.stringify(testData, null, 2));
console.log('\n=== Data Summary ===');
console.log('User ID:', testData.userId);
console.log('Name:', testData.profile.name);
console.log('Type:', testData.type17);
console.log('Tarot Card:', testData.tarot.name);
console.log('Four Pillars Year:', testData.fourPillars.chart.year.天干 + testData.fourPillars.chart.year.地支);
console.log('\n=== Copy the above JSON to test in Make ===');
