import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  tarot: string;
  userId?: string;
  profile: {
    name: string;
    gender: string;
    birthday: string;
  };
  worryText?: string;
  type17: string;
  scores: {
    E: number;
    S: number;
    T: number;
    J: number;
  };
  percents: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  fourPillars: {
    chart: {
      year: { 天干: string; 地支: string; 蔵干: string };
      month: { 天干: string; 地支: string; 蔵干: string };
      day: { 天干: string; 地支: string; 蔵干: string };
      hour: { 天干: string; 地支: string; 蔵干: string };
    };
  };
}

const SYSTEM_PROMPT = `あなたは「性格診断×タロット×四柱推命レポートJSON」を生成するエンジンです。必ず次を守ってください。

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
- section4.items：18項目。各 { titleは12文字以内, descは200文字以内 }`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: RequestBody = await req.json();

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration is missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const userPrompt = `【入力データ】
tarot: ${body.tarot}
userId: ${body.userId || ""}
name: ${body.profile.name}
gender: ${body.profile.gender}
birthday: ${body.profile.birthday}
worryText: ${body.worryText || ""}
type17: ${body.type17}
scores: ${JSON.stringify(body.scores)}
percents: ${JSON.stringify(body.percents)}
fourPillarsChart: ${JSON.stringify(body.fourPillars.chart)}

それでは、上記スキーマに厳密に従ってJSONのみを出力してください。`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    let jsonResult;
    try {
      jsonResult = JSON.parse(generatedContent);
    } catch (parseError) {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse JSON from GPT response");
      }
    }

    if (body.userId) {
      const { error: dbError } = await supabase
        .from("reports")
        .upsert({
          user_id: body.userId,
          report_data: jsonResult,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Failed to save report: ${dbError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: jsonResult }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
