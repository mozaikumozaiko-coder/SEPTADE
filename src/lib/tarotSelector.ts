import { Scores, TarotCard } from '../types';

const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0,
    name: "旅装の童",
    reading: "たびよそおいのわらべ",
    originalName: "愚者",
    keywords: "無垢・旅立ち・直感・自由",
    upright: "やってみる価値。未知へ踏み出すと運が動く。",
    reversed: "無計画・現実逃避。下調べ不足で痛い目。"
  },
  {
    id: 1,
    name: "陰陽師",
    reading: "おんみょうじ",
    originalName: "魔術師",
    keywords: "創造・言霊・技術・発動",
    upright: "言葉と手腕で現実を動かせる。始めるなら今。",
    reversed: "口先だけ・詐術。スキル不足を誤魔化すと崩れる。"
  },
  {
    id: 2,
    name: "奥御簾の巫女",
    reading: "おくみすの みこ",
    originalName: "女教皇",
    keywords: "直観・秘儀・沈黙・内省",
    upright: "答えは内側にある。急がず観察し、読み取る。",
    reversed: "疑心暗鬼・閉じすぎ。情報不足で誤解が増える。"
  },
  {
    id: 3,
    name: "豊穣の太夫",
    reading: "ほうじょうの たゆう",
    originalName: "女帝",
    keywords: "繁栄・美・育成・恵み",
    upright: "愛情と手入れが実る。育てるほど増える。",
    reversed: "甘やかし・浪費。過保護で自立が止まる。"
  },
  {
    id: 4,
    name: "城主",
    reading: "じょうしゅ",
    originalName: "皇帝",
    keywords: "統治・秩序・責任・境界",
    upright: "ルール設計で安定。決めるほど前進する。",
    reversed: "独裁・硬直。支配欲が反発を招く。"
  },
  {
    id: 5,
    name: "社の導師",
    reading: "やしろの どうし",
    originalName: "教皇",
    keywords: "教え・伝統・共同体・儀礼",
    upright: "信頼できる型に乗る。師や規範が助けになる。",
    reversed: "形骸化・同調圧。古い常識が足枷になる。"
  },
  {
    id: 6,
    name: "契りの盃",
    reading: "ちぎりの さかずき",
    originalName: "恋人",
    keywords: "選択・縁・価値観・誓い",
    upright: "心の一致。選ぶほど縁が強くなる。",
    reversed: "迷い・二心。優柔不断が機会を逃す。"
  },
  {
    id: 7,
    name: "疾風の駕籠",
    reading: "しっぷうの かご",
    originalName: "戦車",
    keywords: "突破・制御・勝負・進軍",
    upright: "勢いが勝つ。目的を絞れば一気に進む。",
    reversed: "暴走・空回り。方向性がブレて疲弊する。"
  },
  {
    id: 8,
    name: "天秤の奉行",
    reading: "てんびんの ぶぎょう",
    originalName: "正義",
    keywords: "公正・裁き・契約・因果",
    upright: "筋を通すほど整う。契約・決断に吉。",
    reversed: "不公平・言い訳。責任回避が後で返ってくる。"
  },
  {
    id: 9,
    name: "山寺の隠者",
    reading: "やまでらの いんじゃ",
    originalName: "隠者",
    keywords: "探究・孤独・師・灯",
    upright: "静けさが真実を照らす。学び直しに最適。",
    reversed: "閉じこもり・疑いすぎ。誰も信じず停滞。"
  },
  {
    id: 10,
    name: "廻り盆",
    reading: "まわりぼん",
    originalName: "運命の輪",
    keywords: "転機・巡り・流れ・タイミング",
    upright: "流れが来る。波に乗れば一段上へ。",
    reversed: "停滞・裏目。タイミングを誤ると空回り。"
  },
  {
    id: 11,
    name: "金剛力士",
    reading: "こんごうりきし",
    originalName: "力",
    keywords: "胆力・慈悲・克己・芯",
    upright: "力は優しさで扱う。粘り勝ち。",
    reversed: "短気・自信喪失。感情に飲まれて破壊的。"
  },
  {
    id: 12,
    name: "逆さの修験者",
    reading: "さかさの しゅげんじゃ",
    originalName: "吊るされた男",
    keywords: "受容・視点転換・修行・保留",
    upright: "待つほど見える。損に見えて学びが大きい。",
    reversed: "徒労・被害者意識。意味のない我慢で消耗。"
  },
  {
    id: 13,
    name: "御霊送り",
    reading: "みたまおくり",
    originalName: "死神",
    keywords: "終わり・清算・変容・再生準備",
    upright: "手放して次へ。切り替えが吉。",
    reversed: "未練・惰性。腐った縁を抱えて停滞。"
  },
  {
    id: 14,
    name: "調和の水差し",
    reading: "ちょうわの みずさし",
    originalName: "節制",
    keywords: "中庸・配合・回復・統合",
    upright: "整えれば戻る。混ぜ合わせて最適化。",
    reversed: "偏り・過剰。生活や感情のバランス崩壊。"
  },
  {
    id: 15,
    name: "狐火の契約",
    reading: "きつねびの けいやく",
    originalName: "悪魔",
    keywords: "執着・誘惑・依存・鎖",
    upright: "欲望の正体を見抜け。条件交渉は慎重に。",
    reversed: "解放・断ち切り。依存から抜け出す好機。"
  },
  {
    id: 16,
    name: "落城",
    reading: "らくじょう",
    originalName: "塔",
    keywords: "崩壊・露呈・衝撃・再建",
    upright: "隠していた歪みが露わに。壊して立て直す。",
    reversed: "小崩れ・先延ばし。被害を最小にするなら今修正。"
  },
  {
    id: 17,
    name: "灯台守",
    reading: "とうだいもり",
    originalName: "星",
    keywords: "希望・癒し・導き・素直さ",
    upright: "回復の兆し。信じて継続すれば実る。",
    reversed: "失望・疑い。成果が見えず心が折れやすい。"
  },
  {
    id: 18,
    name: "朧月",
    reading: "おぼろづき",
    originalName: "月",
    keywords: "幻・不安・無意識・霧",
    upright: "直感は鋭いが誤認も増える。確認が鍵。",
    reversed: "霧が晴れる。疑いが解け、実態が見える。"
  },
  {
    id: 19,
    name: "日輪",
    reading: "にちりん",
    originalName: "太陽",
    keywords: "成功・祝福・明快・生命力",
    upright: "堂々と出すほど勝つ。成果が可視化される。",
    reversed: "慢心・空回り。明るさの裏で詰めが甘い。"
  },
  {
    id: 20,
    name: "招魂の太鼓",
    reading: "しょうこんの たいこ",
    originalName: "審判",
    keywords: "覚醒・復活・再挑戦・呼び声",
    upright: "過去が意味を持つ。やり直しは今が吉。",
    reversed: "後悔・自己否定。決断を先送りして機会損失。"
  },
  {
    id: 21,
    name: "結界の円環",
    reading: "けっかいの えんかん",
    originalName: "世界",
    keywords: "完成・統合・達成・次章",
    upright: "一区切り。仕上げて次のステージへ。",
    reversed: "未完成・詰め不足。最後の一手で結果が変わる。"
  }
];

export function selectTarotCard(type: string, scores: Scores): TarotCard {
  const typeValue = type.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const scoresSum = scores.E + scores.S + scores.T + scores.J;
  const seed = typeValue + scoresSum;
  const index = Math.abs(seed) % MAJOR_ARCANA.length;
  return MAJOR_ARCANA[index];
}
