import { DiagnosisResult, Profile } from '../types';
import { Share2, RotateCcw } from 'lucide-react';
import { CircularChart } from './CircularChart';
import { RadarChart } from './RadarChart';
import { compatibility } from '../data/compatibility';
import { typeDetails } from '../data/typeDetails';

interface ResultScreenProps {
  result: DiagnosisResult;
  profile: Profile;
  onRestart: () => void;
}

export function ResultScreen({ result, profile, onRestart }: ResultScreenProps) {
  const handleShare = () => {
    const shareText = `セプテード診断\n\n私の魂の型: ${result.type} - ${result.typeName}\n${result.description}`;

    if (navigator.share) {
      navigator.share({
        title: 'セプテード診断',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('結果を記憶の欠片に写し取った');
    }
  };

  const normalizeScore = (score: number): number => {
    return Math.round((score / 175) * 100);
  };

  const radarData = [
    { label: '外向性', value: normalizeScore(result.scores.E) },
    { label: '感覚型', value: normalizeScore(result.scores.S) },
    { label: '思考型', value: normalizeScore(result.scores.T) },
    { label: '判断型', value: normalizeScore(result.scores.J) },
    { label: '適応力', value: 62 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="max-w-4xl w-full relative">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'url(/an_ultra-luxurious_ornate_chinese_decorative_frame-1767808872546%20copy.png)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.7)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6))',
            backdropFilter: 'blur(1px)',
            pointerEvents: 'none',
          }}
        />
        <div className="relative z-10 space-y-5 sm:space-y-6 md:space-y-8 py-12 px-6 sm:px-8 md:px-12">
        <div className="rounded-lg p-6 sm:p-8 md:p-12 lg:p-16 text-center relative">
          <div className="relative z-10">
            <div className="ancient-frame w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 mx-auto mb-6 sm:mb-8 md:mb-10 rounded"></div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 sm:mb-6 md:mb-8 glow-text" style={{ color: 'var(--pale-gold)' }}>
              魂の顕現
            </h2>

            <p className="text-sm sm:text-base opacity-80 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-loose px-2" style={{ color: 'var(--dim-light)' }}>
              百の問いを経て、汝の魂の真なる姿が明らかとなった。<br />
              終わりゆく世界にて、汝はこの型を宿す者なり。
            </p>

            <div className="inline-block px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 mb-4 sm:mb-5 md:mb-6 rounded relative" style={{
              background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(122, 29, 46, 0.3))',
              border: '2px sm:border-3 solid rgba(166, 124, 82, 0.6)',
              boxShadow: '0 0 40px rgba(166, 124, 82, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)'
            }}>
              <div className="text-sm opacity-70 mb-2" style={{ color: 'var(--pale-light)' }}>
                あなたのタイプ
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 sm:mb-3 glow-text" style={{ color: 'var(--pale-gold)' }}>
                {result.type}
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-semibold" style={{ color: 'var(--pale-light)' }}>
                {result.typeName}
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl leading-loose opacity-90 max-w-3xl mx-auto px-2" style={{ color: 'var(--pale-light)' }}>
              {result.description}
            </p>
          </div>
        </div>

        <div className="relative p-5 sm:p-6 md:p-8 lg:p-10 rounded-lg">
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center glow-text" style={{ color: 'var(--pale-gold)' }}>
              魂の特性
            </h3>

            <div className="mb-8">
              <RadarChart data={radarData} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: 'var(--pale-light)' }}>外向性</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--pale-gold)' }}>{normalizeScore(result.scores.E)}%</div>
              </div>
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: 'var(--pale-light)' }}>内向性</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--pale-gold)' }}>{100 - normalizeScore(result.scores.E)}%</div>
              </div>
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: 'var(--pale-light)' }}>感覚型</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--pale-gold)' }}>{normalizeScore(result.scores.S)}%</div>
              </div>
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: 'var(--pale-light)' }}>直観型</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--pale-gold)' }}>{100 - normalizeScore(result.scores.S)}%</div>
              </div>
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: 'var(--pale-light)' }}>思考型</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--pale-gold)' }}>{normalizeScore(result.scores.T)}%</div>
              </div>
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: 'var(--pale-light)' }}>感情型</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--pale-gold)' }}>{100 - normalizeScore(result.scores.T)}%</div>
              </div>
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: 'var(--pale-light)' }}>判断型</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--pale-gold)' }}>{normalizeScore(result.scores.J)}%</div>
              </div>
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: 'var(--pale-light)' }}>知覚型</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--pale-gold)' }}>{100 - normalizeScore(result.scores.J)}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative p-5 sm:p-6 md:p-8 rounded-lg">
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-center" style={{ color: 'var(--pale-gold)' }}>
              神託札（タロット）
            </h3>
            <p className="text-center text-sm opacity-70 mb-6" style={{ color: 'var(--pale-light)' }}>
              汝の魂に宿る札の啓示
            </p>
            <div className="flex justify-center">
              <div className="w-32 h-48 rounded-lg flex items-center justify-center text-6xl" style={{
                background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(122, 29, 46, 0.3))',
                border: '2px solid rgba(166, 124, 82, 0.6)',
              }}>
                🃏
              </div>
            </div>
            <p className="text-center mt-4 text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
              （札の説明はGPTにて生成されます）
            </p>
          </div>
        </div>

        <div className="scroll-panel relative p-5 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                1. 人格プロファイル（中核設計図）
              </h3>
            </div>

            <div className="leading-loose opacity-90 text-sm sm:text-base" style={{ color: 'var(--pale-light)' }}>
              <p>（400文字の解説がGPTにて生成されます。あなたの本質的な性格特性、価値観、世界観について深く掘り下げた分析がここに表示されます。）</p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>注意すべき点</h4>
              <ul className="space-y-2">
                {result.weaknesses.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed opacity-90">
                    <span className="mt-1 opacity-70" style={{ color: 'var(--rust-red)' }}>◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>汝が宿す特性</h4>
              <div className="flex flex-wrap gap-2">
                {result.characteristics.map((char, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded text-sm font-medium"
                    style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.4), rgba(122, 29, 46, 0.3))',
                      border: '2px solid rgba(166, 124, 82, 0.5)',
                      color: 'var(--pale-light)',
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xl sm:text-2xl font-bold mb-8 text-center" style={{ color: 'var(--pale-gold)' }}>魂の相性</h4>

              <div className="space-y-10">
                <div>
                  <h5 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--ochre)' }}>
                    調和する魂
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {compatibility[result.type]?.goodMatches.map((typeCode) => (
                      <div
                        key={typeCode}
                        className="flex flex-col items-center gap-3 p-4 rounded-lg transition-transform hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(166, 124, 82, 0.2))',
                          border: '2px solid rgba(166, 124, 82, 0.4)',
                        }}
                      >
                        <div
                          className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-900/40 to-yellow-800/30 border-2 border-amber-700/50 flex items-center justify-center"
                          style={{
                            boxShadow: '0 4px 10px rgba(166, 124, 82, 0.3)',
                          }}
                        >
                          <span className="text-xs font-bold text-amber-300">{typeCode}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold" style={{ color: 'var(--pale-gold)' }}>
                            {typeDetails[typeCode]?.name || typeCode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--rust-red)' }}>
                    反発する魂
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {compatibility[result.type]?.badMatches.map((typeCode) => (
                      <div
                        key={typeCode}
                        className="flex flex-col items-center gap-3 p-4 rounded-lg transition-transform hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, rgba(122, 29, 46, 0.3), rgba(78, 0, 21, 0.2))',
                          border: '2px solid rgba(122, 29, 46, 0.4)',
                        }}
                      >
                        <div
                          className="w-20 h-20 rounded-full bg-gradient-to-br from-red-900/40 to-red-950/30 border-2 border-red-800/50 flex items-center justify-center"
                          style={{
                            boxShadow: '0 4px 10px rgba(122, 29, 46, 0.3)',
                          }}
                        >
                          <span className="text-xs font-bold text-red-300">{typeCode}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold" style={{ color: 'var(--pale-gold)' }}>
                            {typeDetails[typeCode]?.name || typeCode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>四柱推命占い</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （四柱推命による運命分析がGPTにて生成されます）
              </p>
            </div>
          </div>
        </div>

        <div className="scroll-panel relative p-5 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                2. 職能ルート解析（勝ち筋の設計）
              </h3>
            </div>

            <div className="leading-loose opacity-90 text-sm sm:text-base" style={{ color: 'var(--pale-light)' }}>
              <p>（400文字の解説がGPTにて生成されます。あなたのキャリアパスと成功への道筋について分析した内容がここに表示されます。）</p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>成果を動かす因子（キャリア加速パラメータ）</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <CircularChart percentage={75} label="精度至上主義" />
                <CircularChart percentage={82} label="到達目標の高設定" />
                <CircularChart percentage={68} label="行動エネルギー" />
                <CircularChart percentage={71} label="主導権志向" />
              </div>
              <p className="text-sm leading-relaxed opacity-90 mt-4 text-center" style={{ color: 'var(--pale-light)' }}>
                （各グラフの詳細解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>戦力コア（再現性のある武器）</h4>
              <ul className="space-y-2">
                {result.strengths.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed opacity-90">
                    <span className="mt-1 opacity-70" style={{ color: 'var(--ochre)' }}>◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>ボトルネック特性（失速リスク）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>適職アーキタイプ候補（高幸福度ルート）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>最適稼働モード（パフォーマンス最大化運用）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>風水</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （風水による運気分析がGPTにて生成されます）
              </p>
            </div>
          </div>
        </div>

        <div className="scroll-panel relative p-5 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                3. 自己進化プラン（伸び代の解放）
              </h3>
            </div>

            <div className="leading-loose opacity-90 text-sm sm:text-base" style={{ color: 'var(--pale-light)' }}>
              <p>（400文字の解説がGPTにて生成されます。あなたの成長可能性と自己改善の方向性について分析した内容がここに表示されます。）</p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>成長パラメータ</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <CircularChart percentage={73} label="再起動力" />
                <CircularChart percentage={79} label="自己確信" />
                <CircularChart percentage={66} label="粘り強さ" />
                <CircularChart percentage={81} label="主導感" />
              </div>
              <p className="text-sm leading-relaxed opacity-90 mt-4 text-center" style={{ color: 'var(--pale-light)' }}>
                （各グラフの詳細解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>伸長資産（伸ばすほど伸びる領域）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>改善レバー（最短で効く調整点）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>エネルギー充電源（回復トリガー）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>消耗要因（エネルギー漏れポイント）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>星辰占（西洋占星術）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （西洋占星術による運命分析がGPTにて生成されます）
              </p>
            </div>
          </div>
        </div>

        <div className="scroll-panel relative p-5 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                4. 対人ダイナミクス解析（相互作用の最適化）
              </h3>
            </div>

            <div className="leading-loose opacity-90 text-sm sm:text-base" style={{ color: 'var(--pale-light)' }}>
              <p>（400文字の解説がGPTにて生成されます。あなたの対人関係スタイルとコミュニケーション特性について分析した内容がここに表示されます。）</p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>関係構築の武器（信頼生成スキル）</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <CircularChart percentage={77} label="自己同一性" />
                <CircularChart percentage={84} label="献身性" />
                <CircularChart percentage={69} label="他者優先性" />
                <CircularChart percentage={72} label="情動理解力" />
              </div>
              <p className="text-sm leading-relaxed opacity-90 mt-4 text-center" style={{ color: 'var(--pale-light)' }}>
                （各グラフの詳細解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>摩擦発生ポイント（誤解・衝突リスク）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>対人適性コア（刺さるコミュニケーション特性）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>対人リスク管理（地雷回避プロトコル）</h4>
              <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                （6項目の解説がGPTにて生成されます）
              </p>
            </div>
          </div>
        </div>

        <div className="relative p-5 sm:p-6 md:p-8 rounded-lg">
          <div className="relative z-10">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: 'var(--pale-gold)' }}>巡礼者の記録</h3>
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
              <div className="opacity-90">
                <span className="opacity-70">御名：</span>
                <span className="ml-3 font-medium">{profile.name}</span>
              </div>
              <div className="opacity-90">
                <span className="opacity-70">性：</span>
                <span className="ml-3 font-medium">{profile.gender}</span>
              </div>
              <div className="md:col-span-2 opacity-90">
                <span className="opacity-70">生誕の日：</span>
                <span className="ml-3 font-medium">{profile.birthdate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5">
          <button
            onClick={handleShare}
            className="mystic-button flex-1 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base px-6 py-3 sm:py-4"
          >
            <Share2 size={18} className="sm:w-5 sm:h-5" />
            <span>魂の形を伝える</span>
          </button>

          <button
            onClick={onRestart}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded border-2 border-white/20 hover:bg-white/5 transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3"
            style={{ color: 'var(--pale-light)' }}
          >
            <RotateCcw size={18} className="sm:w-5 sm:h-5" />
            <span>再び巡礼する</span>
          </button>
        </div>

        <div className="text-center">
          <button
            className="text-sm sm:text-base font-medium opacity-80 hover:opacity-100 transition-opacity underline"
            style={{ color: 'var(--pale-gold)' }}
          >
            全17タイプ一覧
          </button>
        </div>

        <div className="text-center pt-4 sm:pt-6 px-2">
          <p className="text-sm sm:text-base md:text-lg font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
            ─ この診断結果は参考として示されるものなり ─
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
