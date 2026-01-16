import { DiagnosisResult, Profile, GPTReport } from '../types';
import { Share2, RotateCcw, LogOut } from 'lucide-react';
import { CircularChart } from './CircularChart';
import { RadarChart } from './RadarChart';
import { compatibility } from '../data/compatibility';
import { typeDetails } from '../data/typeDetails';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { selectTarotCard } from '../lib/tarotSelector';
import { calculateFourPillars } from '../lib/fourPillars';
import { saveDiagnosisHistory } from '../lib/diagnosisHistory';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ResultScreenProps {
  result: DiagnosisResult;
  profile: Profile;
  onRestart: () => void;
  isFromHistory?: boolean;
}

export function ResultScreen({ result, profile, onRestart, isFromHistory = false }: ResultScreenProps) {
  const [isSending, setIsSending] = useState(false);
  const [, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [autoSent, setAutoSent] = useState(false);
  const [gptReport, setGptReport] = useState<GPTReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substring(7)}`);
  const [showOrderInput, setShowOrderInput] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderError, setOrderError] = useState('');
  const { signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleSendToMake = async (orderId: string) => {
    const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl === 'YOUR_MAKE_WEBHOOK_URL_HERE') {
      console.error('Webhook URL is not configured');
      setSendStatus('error');
      setIsSending(false);
      setAutoSent(true);
      return;
    }

    setIsSending(true);
    setSendStatus('idle');

    const normalizeScoreForWebhook = (score: number): number => {
      return Math.round(Math.max(0, Math.min(100, ((score + 100) / 2))));
    };

    const tarotCard = selectTarotCard(result.type, result.scores);
    const fourPillarsChart = calculateFourPillars(profile.birthdate);

    const dataToSend = {
      orderId: orderId,
      tarot: {
        id: tarotCard.id,
        name: tarotCard.name,
        reading: tarotCard.reading,
        originalName: tarotCard.originalName,
        keywords: tarotCard.keywords,
        upright: tarotCard.upright,
        reversed: tarotCard.reversed,
      },
      userId: userId,
      profile: {
        name: profile.name,
        gender: profile.gender,
        birthday: profile.birthdate,
      },
      worryText: profile.concern,
      type17: result.type,
      scores: result.scores,
      percents: {
        E: normalizeScoreForWebhook(result.scores.E),
        I: 100 - normalizeScoreForWebhook(result.scores.E),
        S: normalizeScoreForWebhook(result.scores.S),
        N: 100 - normalizeScoreForWebhook(result.scores.S),
        T: normalizeScoreForWebhook(result.scores.T),
        F: 100 - normalizeScoreForWebhook(result.scores.T),
        J: normalizeScoreForWebhook(result.scores.J),
        P: 100 - normalizeScoreForWebhook(result.scores.J),
      },
      fourPillars: {
        chart: fourPillarsChart,
      },
      diagnosis: {
        typeName: result.typeName,
        description: result.description,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        characteristics: result.characteristics,
        compatibility: {
          goodMatches: compatibility[result.type]?.goodMatches || [],
          badMatches: compatibility[result.type]?.badMatches || [],
        },
      },
    };

    try {
      console.log('Sending data to Make:', JSON.stringify(dataToSend, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));

        if (responseData.valid === false || responseData.status === 'invalid' || responseData.error === 'invalid') {
          setSendStatus('error');
          setOrderError('オーダー番号が無効です。再度入力してください。');
          setOrderNumber('');
        } else {
          setSendStatus('success');
          console.log('Successfully sent to Make');
          alert('番号を確認できました　そのままお待ちください');
          setShowOrderInput(false);
          setOrderNumber('');
          setOrderError('');
          setIsLoadingReport(true);
          startReportPolling();
        }
      } else {
        const errorData = await response.text().catch(() => '');
        if (errorData.includes('無効') || errorData.includes('invalid') || response.status === 400) {
          setSendStatus('error');
          setOrderError('オーダー番号が無効です。再度入力してください。');
          setOrderNumber('');
        } else {
          setSendStatus('error');
          console.error('Failed to send to Make:', response.status, response.statusText);
          setOrderError('送信に失敗しました。もう一度お試しください。');
        }
      }
    } catch (error) {
      console.error('Error sending to Make:', error);
      setSendStatus('error');
      setOrderError('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSending(false);
      setAutoSent(true);
    }
  };

  const handleUnlockResults = () => {
    setShowOrderInput(true);
    setOrderError('');
    setOrderNumber('');
  };

  const handleOrderSubmit = () => {
    if (!orderNumber.trim()) {
      setOrderError('オーダー番号を入力してください');
      return;
    }
    setOrderError('');
    handleSendToMake(orderNumber);
  };

  const fetchReportFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('report_data')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching report:', error);
        return null;
      }

      if (data && data.report_data) {
        setGptReport(data.report_data as GPTReport);
        setIsLoadingReport(false);
        return data.report_data;
      }

      return null;
    } catch (error) {
      console.error('Error fetching report:', error);
      return null;
    }
  };

  const startReportPolling = () => {
    setIsLoadingReport(true);

    const pollInterval = setInterval(async () => {
      const report = await fetchReportFromSupabase();
      if (report) {
        clearInterval(pollInterval);
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(pollInterval);
      if (!gptReport) {
        setIsLoadingReport(false);
      }
    }, 120000);
  };

  useEffect(() => {
    if (!isFromHistory) {
      saveDiagnosisHistory(profile, result);
    }
  }, [isFromHistory]);

  const normalizeScore = (score: number): number => {
    return Math.round(Math.max(0, Math.min(100, ((score + 100) / 2))));
  };

  const radarData = [
    { label: '外向性', value: normalizeScore(result.scores.E) },
    { label: '感覚型', value: normalizeScore(result.scores.S) },
    { label: '思考型', value: normalizeScore(result.scores.T) },
    { label: '判断型', value: normalizeScore(result.scores.J) },
    { label: '適応力', value: 62 },
  ];

  return (
    <>
      {showOrderInput && (
        <div
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(15px)',
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div className="max-w-md w-full p-6 sm:p-8 rounded-lg" style={{
            background: 'rgba(0, 0, 0, 0.95)',
            border: '3px solid rgba(191, 167, 110, 0.8)',
            boxShadow: '0 0 60px rgba(191, 167, 110, 0.5), inset 0 0 30px rgba(166, 124, 82, 0.2)',
          }}>
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center glow-text" style={{
              color: 'var(--pale-gold)',
              textShadow: '0 0 20px rgba(191, 167, 110, 0.8)',
            }}>
              オーダー番号を入力してください
            </h3>
            <p className="text-sm sm:text-base mb-6 text-center leading-relaxed" style={{ color: 'var(--pale-light)' }}>
              例：1019088409
            </p>

            {orderError && (
              <div className="mb-4 p-4 rounded text-center space-y-3" style={{
                background: 'rgba(122, 29, 46, 0.3)',
                border: '2px solid rgba(122, 29, 46, 0.6)',
                color: 'var(--rust-red)',
              }}>
                <div>{orderError}</div>
                {orderError.includes('無効') && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-sm mb-3" style={{ color: 'var(--pale-light)' }}>
                      購入されていない方はこちらから
                    </p>
                    <a
                      href="https://y8q9lwkafozp6bxasu8o.stores.jp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.4), rgba(166, 124, 82, 0.3))',
                        border: '2px solid rgba(191, 167, 110, 0.8)',
                        color: 'var(--pale-gold)',
                        textShadow: '0 0 10px rgba(191, 167, 110, 0.6)',
                      }}
                    >
                      購入サイトへ
                    </a>
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              value={orderNumber}
              onChange={(e) => {
                setOrderNumber(e.target.value);
                setOrderError('');
              }}
              placeholder="オーダー番号"
              disabled={isSending}
              className="w-full px-4 py-4 mb-6 rounded text-center text-lg font-medium"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '2px solid rgba(166, 124, 82, 0.5)',
                color: 'var(--pale-light)',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid rgba(191, 167, 110, 0.8)';
                e.target.style.boxShadow = '0 0 20px rgba(191, 167, 110, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid rgba(166, 124, 82, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleOrderSubmit();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOrderInput(false);
                  setOrderNumber('');
                  setOrderError('');
                }}
                disabled={isSending}
                className="flex-1 px-4 py-3 rounded border-2 border-white/20 hover:bg-white/5 transition-all duration-300 font-semibold text-sm sm:text-base disabled:opacity-50"
                style={{ color: 'var(--pale-light)' }}
              >
                キャンセル
              </button>
              <button
                onClick={handleOrderSubmit}
                disabled={isSending}
                className="flex-1 mystic-button px-4 py-3 text-sm sm:text-base font-bold disabled:opacity-50"
              >
                {isSending ? '送信中...' : '送信'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-4xl w-full relative">
        <div className="relative z-10 space-y-5 sm:space-y-6 md:space-y-8 py-12 px-6 sm:px-8 md:px-12">
        <div className="rounded-lg p-6 sm:p-8 md:p-12 lg:p-16 text-center relative" style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(15px)',
        }}>
          <div className="relative z-10">
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

        <div className="relative p-5 sm:p-6 md:p-8 lg:p-10 rounded-lg" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
        }}>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center glow-text" style={{ color: 'var(--pale-gold)' }}>
              魂の特性
            </h3>

            <div className="mb-8">
              <RadarChart data={radarData} />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-2" style={{ color: 'var(--pale-light)' }}>
                  <span className="font-medium">外向性 {normalizeScore(result.scores.E)}%</span>
                  <span className="font-medium">{100 - normalizeScore(result.scores.E)}% 内向性</span>
                </div>
                <div className="relative h-8 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(122, 29, 46, 0.3))',
                  border: '1px solid rgba(166, 124, 82, 0.4)',
                }}>
                  <div
                    className="absolute left-0 top-0 h-full transition-all duration-500"
                    style={{
                      width: `${normalizeScore(result.scores.E)}%`,
                      background: 'linear-gradient(90deg, rgba(191, 167, 110, 0.6), rgba(166, 124, 82, 0.8))',
                      boxShadow: '0 0 10px rgba(191, 167, 110, 0.5)',
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2" style={{ color: 'var(--pale-light)' }}>
                  <span className="font-medium">感覚型 {normalizeScore(result.scores.S)}%</span>
                  <span className="font-medium">{100 - normalizeScore(result.scores.S)}% 直観型</span>
                </div>
                <div className="relative h-8 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(122, 29, 46, 0.3))',
                  border: '1px solid rgba(166, 124, 82, 0.4)',
                }}>
                  <div
                    className="absolute left-0 top-0 h-full transition-all duration-500"
                    style={{
                      width: `${normalizeScore(result.scores.S)}%`,
                      background: 'linear-gradient(90deg, rgba(191, 167, 110, 0.6), rgba(166, 124, 82, 0.8))',
                      boxShadow: '0 0 10px rgba(191, 167, 110, 0.5)',
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2" style={{ color: 'var(--pale-light)' }}>
                  <span className="font-medium">思考型 {normalizeScore(result.scores.T)}%</span>
                  <span className="font-medium">{100 - normalizeScore(result.scores.T)}% 感情型</span>
                </div>
                <div className="relative h-8 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(122, 29, 46, 0.3))',
                  border: '1px solid rgba(166, 124, 82, 0.4)',
                }}>
                  <div
                    className="absolute left-0 top-0 h-full transition-all duration-500"
                    style={{
                      width: `${normalizeScore(result.scores.T)}%`,
                      background: 'linear-gradient(90deg, rgba(191, 167, 110, 0.6), rgba(166, 124, 82, 0.8))',
                      boxShadow: '0 0 10px rgba(191, 167, 110, 0.5)',
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2" style={{ color: 'var(--pale-light)' }}>
                  <span className="font-medium">判断型 {normalizeScore(result.scores.J)}%</span>
                  <span className="font-medium">{100 - normalizeScore(result.scores.J)}% 知覚型</span>
                </div>
                <div className="relative h-8 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(122, 29, 46, 0.3))',
                  border: '1px solid rgba(166, 124, 82, 0.4)',
                }}>
                  <div
                    className="absolute left-0 top-0 h-full transition-all duration-500"
                    style={{
                      width: `${normalizeScore(result.scores.J)}%`,
                      background: 'linear-gradient(90deg, rgba(191, 167, 110, 0.6), rgba(166, 124, 82, 0.8))',
                      boxShadow: '0 0 10px rgba(191, 167, 110, 0.5)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative p-5 sm:p-6 md:p-8 rounded-lg" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
        }}>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-center" style={{ color: 'var(--pale-gold)' }}>
              神託札（タロット）
            </h3>
            <p className="text-center text-sm opacity-70 mb-6" style={{ color: 'var(--pale-light)' }}>
              汝の魂に宿る札の啓示
            </p>

            {(() => {
              const tarotCard = selectTarotCard(result.type, result.scores);
              return (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-56 rounded-lg flex flex-col items-center justify-center text-center p-4 mb-4" style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.4), rgba(122, 29, 46, 0.4))',
                      border: '3px solid rgba(166, 124, 82, 0.7)',
                      boxShadow: '0 0 30px rgba(166, 124, 82, 0.4)',
                    }}>
                      <div className="text-5xl mb-3">🃏</div>
                      <div className="text-lg font-bold mb-1" style={{ color: 'var(--pale-gold)' }}>
                        {tarotCard.name}
                      </div>
                      <div className="text-xs opacity-70" style={{ color: 'var(--pale-light)' }}>
                        {tarotCard.reading}
                      </div>
                      <div className="text-xs opacity-60 mt-2" style={{ color: 'var(--pale-light)' }}>
                        〔{tarotCard.originalName}〕
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-lg" style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.2), rgba(122, 29, 46, 0.2))',
                      border: '1px solid rgba(166, 124, 82, 0.4)',
                    }}>
                      <div className="text-sm font-bold mb-2" style={{ color: 'var(--pale-gold)' }}>
                        キーワード
                      </div>
                      <div className="text-sm opacity-90" style={{ color: 'var(--pale-light)' }}>
                        {tarotCard.keywords}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.2), rgba(122, 29, 46, 0.2))',
                      border: '1px solid rgba(166, 124, 82, 0.4)',
                    }}>
                      <div className="text-sm font-bold mb-2" style={{ color: 'var(--ochre)' }}>
                        正位置
                      </div>
                      <div className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                        {tarotCard.upright}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.2), rgba(122, 29, 46, 0.2))',
                      border: '1px solid rgba(166, 124, 82, 0.4)',
                    }}>
                      <div className="text-sm font-bold mb-2" style={{ color: 'var(--rust-red)' }}>
                        逆位置
                      </div>
                      <div className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                        {tarotCard.reversed}
                      </div>
                    </div>
                  </div>

                  {gptReport?.tarotExplanation && (
                    <div className="p-4 rounded-lg" style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(122, 29, 46, 0.3))',
                      border: '2px solid rgba(166, 124, 82, 0.5)',
                    }}>
                      <div className="text-sm font-bold mb-2 text-center" style={{ color: 'var(--pale-gold)' }}>
                        神託の解釈
                      </div>
                      <p className="text-sm leading-relaxed opacity-90 text-center" style={{ color: 'var(--pale-light)' }}>
                        {gptReport.tarotExplanation}
                      </p>
                    </div>
                  )}

                  {isLoadingReport && !gptReport?.tarotExplanation && (
                    <p className="text-center text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                      神託を読み解いています...
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="scroll-panel result-panel relative p-5 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                1. 人格プロファイル（中核設計図）
              </h3>
            </div>

            <div className="leading-loose opacity-90 text-sm sm:text-base" style={{ color: 'var(--pale-light)' }}>
              {isLoadingReport ? (
                <p>神託を読み解いています...</p>
              ) : gptReport?.section1?.content ? (
                <p>{gptReport.section1.content}</p>
              ) : (
                <p>あなたの本質的な性格特性、価値観、世界観について深く掘り下げた分析がここに表示されます。</p>
              )}
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>注意すべき点</h4>
              <ul className="space-y-2">
                {typeDetails[result.type]?.detailedWeaknesses.map((item, index) => (
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
              {isLoadingReport ? (
                <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                  命式を読み解いています...
                </p>
              ) : gptReport?.fourPillars ? (
                <>
                  <div className="mb-4 p-4 rounded-lg" style={{
                    background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.2), rgba(122, 29, 46, 0.2))',
                    border: '1px solid rgba(166, 124, 82, 0.3)',
                  }}>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
                      <div>
                        <div className="font-bold mb-1" style={{ color: 'var(--pale-gold)' }}>年柱</div>
                        <div style={{ color: 'var(--pale-light)' }}>{gptReport.fourPillars.chart.year.天干}</div>
                        <div style={{ color: 'var(--pale-light)' }}>{gptReport.fourPillars.chart.year.地支}</div>
                      </div>
                      <div>
                        <div className="font-bold mb-1" style={{ color: 'var(--pale-gold)' }}>月柱</div>
                        <div style={{ color: 'var(--pale-light)' }}>{gptReport.fourPillars.chart.month.天干}</div>
                        <div style={{ color: 'var(--pale-light)' }}>{gptReport.fourPillars.chart.month.地支}</div>
                      </div>
                      <div>
                        <div className="font-bold mb-1" style={{ color: 'var(--pale-gold)' }}>日柱</div>
                        <div style={{ color: 'var(--pale-light)' }}>{gptReport.fourPillars.chart.day.天干}</div>
                        <div style={{ color: 'var(--pale-light)' }}>{gptReport.fourPillars.chart.day.地支}</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90 mb-4" style={{ color: 'var(--pale-light)' }}>
                    {gptReport.fourPillars.basic}
                  </p>
                  {gptReport.fourPillars.charts && gptReport.fourPillars.charts.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-2 mb-4 justify-items-center">
                      {gptReport.fourPillars.charts.map((chart, index) => (
                        <CircularChart key={index} percentage={chart.value} label={chart.title} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                  四柱推命による運命分析がGPTにて生成されます
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="scroll-panel result-panel relative p-5 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                2. 職能ルート解析（勝ち筋の設計）
              </h3>
            </div>

            <div className="leading-loose opacity-90 text-sm sm:text-base" style={{ color: 'var(--pale-light)' }}>
              {isLoadingReport ? (
                <p>分析中...</p>
              ) : gptReport?.section2?.content ? (
                <p>{gptReport.section2.content}</p>
              ) : (
                <p>あなたのキャリアパスと成功への道筋について分析した内容がここに表示されます。</p>
              )}
            </div>

            {gptReport?.section2?.charts && gptReport.section2.charts.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>成果を動かす因子（キャリア加速パラメータ）</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {gptReport.section2.charts.map((chart, index) => (
                    <div key={index}>
                      <CircularChart percentage={chart.value} label={chart.title} />
                      <p className="text-xs leading-relaxed opacity-80 mt-2 text-center" style={{ color: 'var(--pale-light)' }}>
                        {chart.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gptReport?.section2?.items && gptReport.section2.items.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>詳細分析</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gptReport.section2.items.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg" style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.2), rgba(122, 29, 46, 0.2))',
                      border: '1px solid rgba(166, 124, 82, 0.3)',
                    }}>
                      <h5 className="font-bold mb-2 text-sm" style={{ color: 'var(--pale-gold)' }}>{item.title}</h5>
                      <p className="text-xs opacity-90" style={{ color: 'var(--pale-light)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="scroll-panel result-panel relative p-5 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                あなたに向いている職業TOP10
              </h3>
            </div>

            <div className="leading-loose opacity-90 text-sm sm:text-base" style={{ color: 'var(--pale-light)' }}>
              <p className="mb-6 text-center">あなたの魂の型に最も調和する職業の指針</p>
              <div className="space-y-3">
                {typeDetails[result.type]?.topCareers.map((career, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.2), rgba(122, 29, 46, 0.2))',
                      border: '1px solid rgba(166, 124, 82, 0.3)',
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.3), rgba(166, 124, 82, 0.4))',
                        border: '2px solid rgba(166, 124, 82, 0.5)',
                        color: 'var(--pale-gold)',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: 'var(--pale-light)' }}>{career}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-panel result-panel relative p-5 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                3. 自己進化プラン（伸び代の解放）
              </h3>
            </div>

            <div className="leading-loose opacity-90 text-sm sm:text-base" style={{ color: 'var(--pale-light)' }}>
              {isLoadingReport ? (
                <p>分析中...</p>
              ) : gptReport?.section3?.content ? (
                <p>{gptReport.section3.content}</p>
              ) : (
                <p>あなたの成長可能性と自己改善の方向性について分析した内容がここに表示されます。</p>
              )}
            </div>

            {gptReport?.section3?.charts && gptReport.section3.charts.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>成長パラメータ</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {gptReport.section3.charts.map((chart, index) => (
                    <div key={index}>
                      <CircularChart percentage={chart.value} label={chart.title} />
                      <p className="text-xs leading-relaxed opacity-80 mt-2 text-center" style={{ color: 'var(--pale-light)' }}>
                        {chart.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gptReport?.section3?.items && gptReport.section3.items.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>自己進化の指針</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gptReport.section3.items.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg" style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.2), rgba(122, 29, 46, 0.2))',
                      border: '1px solid rgba(166, 124, 82, 0.3)',
                    }}>
                      <h5 className="font-bold mb-2 text-sm" style={{ color: 'var(--pale-gold)' }}>{item.title}</h5>
                      <p className="text-xs opacity-90" style={{ color: 'var(--pale-light)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gptReport?.astrology && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>星辰占（西洋占星術）</h4>
                <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                  {gptReport.astrology}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="scroll-panel result-panel relative p-5 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="text-center border-b border-white/10 pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                4. 対人ダイナミクス解析（相互作用の最適化）
              </h3>
            </div>

            <div className="leading-loose opacity-90 text-sm sm:text-base" style={{ color: 'var(--pale-light)' }}>
              {isLoadingReport ? (
                <p>分析中...</p>
              ) : gptReport?.section4?.content ? (
                <p>{gptReport.section4.content}</p>
              ) : (
                <p>あなたの対人関係スタイルとコミュニケーション特性について分析した内容がここに表示されます。</p>
              )}
            </div>

            {gptReport?.section4?.charts && gptReport.section4.charts.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>関係構築の武器（信頼生成スキル）</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {gptReport.section4.charts.map((chart, index) => (
                    <div key={index}>
                      <CircularChart percentage={chart.value} label={chart.title} />
                      <p className="text-xs leading-relaxed opacity-80 mt-2 text-center" style={{ color: 'var(--pale-light)' }}>
                        {chart.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gptReport?.section4?.items && gptReport.section4.items.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>対人ダイナミクスの詳細</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gptReport.section4.items.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg" style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.2), rgba(122, 29, 46, 0.2))',
                      border: '1px solid rgba(166, 124, 82, 0.3)',
                    }}>
                      <h5 className="font-bold mb-2 text-sm" style={{ color: 'var(--pale-gold)' }}>{item.title}</h5>
                      <p className="text-xs opacity-90" style={{ color: 'var(--pale-light)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative p-5 sm:p-6 md:p-8 rounded-lg" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
        }}>
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

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-8 py-6 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.4), rgba(166, 124, 82, 0.3))',
              border: '3px solid rgba(191, 167, 110, 0.9)',
              boxShadow: '0 0 50px rgba(191, 167, 110, 0.6), inset 0 0 30px rgba(166, 124, 82, 0.3)',
              textShadow: '0 0 15px rgba(191, 167, 110, 0.8)',
            }}
          >
            <Share2 size={24} className="sm:w-7 sm:h-7" />
            <span className="text-xl sm:text-2xl md:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
              魂の形を伝える
            </span>
          </button>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5">
            <button
              onClick={handleUnlockResults}
              className="mystic-button flex-1 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base px-6 py-3 sm:py-4"
            >
              <span>全ての結果を開放する</span>
            </button>

            <button
              onClick={onRestart}
              className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded border-2 border-white/20 hover:bg-white/5 transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3"
              style={{ color: 'var(--pale-light)' }}
            >
              <RotateCcw size={18} className="sm:w-5 sm:h-5" />
              <span>再び巡礼する</span>
            </button>

            <button
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded border-2 border-white/20 hover:bg-white/5 transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3"
              style={{ color: 'var(--pale-light)' }}
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
              <span>ログアウト</span>
            </button>
          </div>
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
    </>
  );
}
