import { TypeDetail } from '../types';

export const typeDetails: Record<string, TypeDetail> = {
  'ESTJ': {
    code: 'ESTJ',
    name: '執行官',
    title: '秩序の守護者',
    description: '責任感が強く、組織を統率する能力に優れる。現実的で効率的な方法を好み、伝統を重んじる。',
    characteristics: ['リーダーシップ', '実践的', '組織的', '責任感'],
    strengths: ['決断力がある', '信頼できる', '効率的に物事を進める'],
    weaknesses: ['柔軟性に欠ける', '感情面での配慮が不足しがち'],
    advice: '時には直感や感情にも耳を傾け、柔軟な対応を心がけよう。'
  },
  'ENTJ': {
    code: 'ENTJ',
    name: '指揮官',
    title: '戦略の王者',
    description: '生まれながらのリーダー。長期的なビジョンを持ち、目標達成に向けて戦略的に行動する。',
    characteristics: ['戦略的思考', 'リーダーシップ', '決断力', '効率重視'],
    strengths: ['ビジョンを持つ', '効率的', '自信がある'],
    weaknesses: ['他者の感情を軽視しがち', '批判的すぎる'],
    advice: 'チームメンバーの感情にも配慮し、協力的なアプローチを取ろう。'
  },
  'ESFJ': {
    code: 'ESFJ',
    name: '領事官',
    title: '調和の紡ぎ手',
    description: '社交的で思いやりがあり、他者のニーズに敏感。調和のとれた環境を作ることに喜びを感じる。',
    characteristics: ['思いやり', '協調性', '責任感', '社交的'],
    strengths: ['他者をサポートする', '組織的', '忠実'],
    weaknesses: ['批判に敏感', '自己犠牲的になりがち'],
    advice: '自分のニーズも大切にし、時には断る勇気を持とう。'
  },
  'ENFJ': {
    code: 'ENFJ',
    name: '主人公',
    title: '導きの光',
    description: 'カリスマ性があり、他者を鼓舞する能力に優れる。理想主義的で、人々の成長を支援することに情熱を注ぐ。',
    characteristics: ['カリスマ性', '共感力', '理想主義', 'インスピレーション'],
    strengths: ['人を動かす', '共感的', 'ビジョンを持つ'],
    weaknesses: ['過度に理想主義的', '自己批判的'],
    advice: '完璧を求めすぎず、現実的な目標設定を心がけよう。'
  },
  'ISTJ': {
    code: 'ISTJ',
    name: '管理者',
    title: '沈黙の守護者',
    description: '信頼性が高く、責任感が強い。詳細に注意を払い、確立された方法を尊重する。',
    characteristics: ['信頼性', '実務的', '責任感', '論理的'],
    strengths: ['信頼できる', '組織的', '忠実'],
    weaknesses: ['変化に抵抗しがち', '感情表現が苦手'],
    advice: '新しいアイデアにも目を向け、感情を表現することも試してみよう。'
  },
  'INTJ': {
    code: 'INTJ',
    name: '建築家',
    title: '孤高の戦略家',
    description: '独立心が強く、創造的な問題解決者。長期的な計画を立て、複雑な問題に取り組むことを好む。',
    characteristics: ['戦略的', '独立心', '分析的', '創造的'],
    strengths: ['戦略的思考', '独創的', '決断力がある'],
    weaknesses: ['他者の感情を軽視しがち', '頑固'],
    advice: '他者の視点も考慮し、協力することの価値を認識しよう。'
  },
  'ISFJ': {
    code: 'ISFJ',
    name: '擁護者',
    title: '静かなる献身者',
    description: '思いやりがあり、献身的。他者のニーズに敏感で、安定と調和を重視する。',
    characteristics: ['思いやり', '献身的', '責任感', '忠実'],
    strengths: ['サポート力がある', '信頼できる', '細やかな配慮'],
    weaknesses: ['自己主張が弱い', '変化に抵抗しがち'],
    advice: '自分の意見も大切にし、時には変化を受け入れよう。'
  },
  'INFJ': {
    code: 'INFJ',
    name: '提唱者',
    title: '神秘の賢者',
    description: '理想主義的で洞察力に優れる。深い共感力を持ち、他者の成長を支援することに情熱を注ぐ。',
    characteristics: ['洞察力', '理想主義', '共感力', '創造的'],
    strengths: ['深い洞察力', '共感的', 'ビジョンを持つ'],
    weaknesses: ['完璧主義', '燃え尽きやすい'],
    advice: '自分を大切にし、現実的な期待値を設定しよう。'
  },
  'ESTP': {
    code: 'ESTP',
    name: '起業家',
    title: '瞬間の支配者',
    description: 'エネルギッシュで行動的。リスクを恐れず、現在の瞬間を最大限に楽しむ。',
    characteristics: ['行動力', '柔軟性', '実践的', '社交的'],
    strengths: ['適応力がある', '問題解決が早い', 'エネルギッシュ'],
    weaknesses: ['衝動的', '長期計画が苦手'],
    advice: '長期的な視点も持ち、計画性を養おう。'
  },
  'ENTP': {
    code: 'ENTP',
    name: '討論者',
    title: '知の挑戦者',
    description: '知的好奇心が旺盛で、議論を楽しむ。創造的な問題解決者で、新しいアイデアを探求する。',
    characteristics: ['知的', '創造的', '議論好き', '柔軟性'],
    strengths: ['創造的', '適応力がある', '知的刺激を与える'],
    weaknesses: ['議論好きすぎる', '細部を見落としがち'],
    advice: '実行に移すことも大切。細部にも注意を払おう。'
  },
  'ESFP': {
    code: 'ESFP',
    name: 'エンターテイナー',
    title: '歓喜の使者',
    description: '社交的で楽観的。周囲を楽しませることが得意で、現在を全力で楽しむ。',
    characteristics: ['社交的', '楽観的', 'spontaneous', '親しみやすい'],
    strengths: ['人を楽しませる', '適応力がある', 'ポジティブ'],
    weaknesses: ['計画性に欠ける', '批判に敏感'],
    advice: '将来のことも考え、時には計画を立てることも大切。'
  },
  'ENFP': {
    code: 'ENFP',
    name: '運動家',
    title: '自由なる魂',
    description: '熱意があり、創造的。人々とのつながりを大切にし、新しい可能性を探求する。',
    characteristics: ['熱意', '創造的', '社交的', '理想主義'],
    strengths: ['熱意がある', 'インスピレーションを与える', '柔軟'],
    weaknesses: ['集中力が続かない', '現実的でないことがある'],
    advice: '一つのことに集中し、現実的な目標設定をしよう。'
  },
  'ISTP': {
    code: 'ISTP',
    name: '巨匠',
    title: '静かなる職人',
    description: '実践的で論理的。手を動かして問題を解決することを好み、独立心が強い。',
    characteristics: ['実践的', '論理的', '独立心', '柔軟性'],
    strengths: ['問題解決能力', '冷静', '適応力がある'],
    weaknesses: ['感情表現が苦手', 'コミットメントを避けがち'],
    advice: '感情も大切にし、長期的なコミットメントの価値を認識しよう。'
  },
  'INTP': {
    code: 'INTP',
    name: '論理学者',
    title: '思考の迷宮',
    description: '論理的で分析的。複雑な問題を解くことに喜びを感じ、知的探求を楽しむ。',
    characteristics: ['論理的', '分析的', '独立心', '知的好奇心'],
    strengths: ['分析力がある', '創造的', '客観的'],
    weaknesses: ['社交性に欠ける', '完璧主義'],
    advice: '実行に移すことも大切。社交性を養おう。'
  },
  'ISFP': {
    code: 'ISFP',
    name: '冒険家',
    title: '静かなる芸術家',
    description: '芸術的で感性豊か。自分の価値観を大切にし、調和を求める。',
    characteristics: ['芸術的', '感性豊か', '柔軟性', '思いやり'],
    strengths: ['創造的', '思いやりがある', '柔軟'],
    weaknesses: ['自己主張が弱い', '計画性に欠ける'],
    advice: '自分の意見を表現し、時には計画を立てることも大切。'
  },
  'INFP': {
    code: 'INFP',
    name: '仲介者',
    title: '夢見る理想家',
    description: '理想主義的で創造的。自分の価値観を大切にし、真実と調和を追求する。',
    characteristics: ['理想主義', '創造的', '共感力', '価値観重視'],
    strengths: ['共感的', '創造的', '誠実'],
    weaknesses: ['現実逃避しがち', '自己批判的'],
    advice: '現実も受け入れ、自分に優しくしよう。'
  },
  'ENTJ-A': {
    code: 'ENTJ-A',
    name: '皇帝',
    title: '絶対なる統率者',
    description: '強力なリーダーシップと明確なビジョンを持つ。目標達成のために戦略的かつ果敢に行動する。',
    characteristics: ['強力なリーダーシップ', '戦略的思考', '決断力', '自信'],
    strengths: ['ビジョンを実現する', '効率的', 'カリスマ性'],
    weaknesses: ['独裁的になりがち', '他者の意見を軽視'],
    advice: '協力とチームワークの価値を認識し、柔軟性を持とう。'
  }
};
