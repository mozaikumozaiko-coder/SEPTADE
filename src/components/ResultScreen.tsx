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
    // ここが「一番後ろの背景」：画像は使わず、CSSで背景だけ維持（result-page-bg）
    <div className="result-page-bg min-h-screen px-3 sm:px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl w-full">
        {/* 上・中・下の3枚で作るフレーム（他の画像は使わない） */}
        <div className="frame-3slice">
          {/* 内側：ここに全コンテンツ */}
          <div className="frame-inner space-y-5 sm:space-y-6 md:space-y-8">

            {/* 以降：あなたの既存コンテンツを「そのまま」貼る */}

            <div
              className="glass-card rounded-lg p-6 sm:p-8 md:p-12 lg:p-16 text-center relative"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="relative z-10">
                {/* ここは画像を使わず装飾を簡素化（必要なら消してOK） */}
                <div className="mx-auto mb-6 sm:mb-8 md:mb-10 w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-lg border border-white/10 bg-white/5" />

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 sm:mb-6 md:mb-8 glow-text" style={{ color: 'var(--pale-gold)' }}>
                  魂の顕現
                </h2>

                <p className="text-sm sm:text-base opacity-80 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-loose px-2" style={{ color: 'var(--dim-light)' }}>
                  百の問いを経て、汝の魂の真なる姿が明らかとなった。<br />
                  終わりゆく世界にて、汝はこの型を宿す者なり。
                </p>

                <div
                  className="inline-block px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 mb-4 sm:mb-5 md:mb-6 rounded relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(122, 29, 46, 0.3))',
                    border: '2px solid rgba(166, 124, 82, 0.6)',
                    boxShadow: '0 0 40px rgba(166, 124, 82, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
                  }}
                >
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

            <div className="glass-card relative p-5 sm:p-6 md:p-8 lg:p-10 rounded-lg">
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

            {/* あなたが貼った残りの大量セクションは、このまま frame-inner の中に続けて貼ってください */}
            {/* 重要：外側の「absolute背景 repeat-y」はもう不要です（削除済み） */}

            {/* ボタン類（例として残す） */}
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

          </div>
        </div>
      </div>
    </div>
  );
}
