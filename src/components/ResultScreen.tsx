import { DiagnosisResult, Profile, GPTReport } from '../types';
import { RotateCcw, LogOut, BookOpen, Users } from 'lucide-react';
import { CircularChart } from './CircularChart';
import { RadarChart } from './RadarChart';
import { compatibility } from '../data/compatibility';
import { typeDetails } from '../data/typeDetails';
import { useState, useEffect, useCallback } from 'react';
import { selectTarotCard } from '../lib/tarotSelector';
import { calculateFourPillars } from '../lib/fourPillars';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { saveDiagnosisHistory } from '../lib/diagnosisHistory';

interface ResultScreenProps {
  result: DiagnosisResult;
  profile: Profile;
  onRestart: () => void;
  isFromHistory?: boolean;
  onHistoryRefresh?: () => void;
  historySendUserId?: string;
  historyGptReport?: any;
}

export function ResultScreen({ result, profile, onRestart, isFromHistory = false, onHistoryRefresh, historySendUserId, historyGptReport }: ResultScreenProps) {
  const [isSending, setIsSending] = useState(false);
  const [, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [gptReport, setGptReport] = useState<GPTReport | null>(() => {
    if (isFromHistory && historyGptReport) {
      return historyGptReport;
    }
    return null;
  });
  const [isLoadingReport, setIsLoadingReport] = useState(() => {
    if (isFromHistory) return false;
    const stored = sessionStorage.getItem('isLoadingReport');
    return stored === 'true';
  });
  const { user, signOut } = useAuth();
  const [userId, setUserId] = useState(() => {
    if (user?.email) return user.email;
    const stored = localStorage.getItem('temp_user_id');
    if (stored) return stored;
    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('temp_user_id', newId);
    return newId;
  });
  const [showOrderInput, setShowOrderInput] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderError, setOrderError] = useState('');
  const [pastReports, setPastReports] = useState<GPTReport[]>([]);
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  const [pollingStartTime, setPollingStartTime] = useState<string | null>(() => {
    if (isFromHistory) return null;
    return sessionStorage.getItem('pollingStartTime');
  });
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(() => {
    if (isFromHistory) return null;
    return sessionStorage.getItem('currentOrderId');
  });
  const [isWaitingForNewReport, setIsWaitingForNewReport] = useState(() => {
    if (isFromHistory) return false;
    return sessionStorage.getItem('isWaitingForNewReport') === 'true';
  });
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isFromHistory) {
      // Clear polling state when viewing history
      sessionStorage.removeItem('isLoadingReport');
      sessionStorage.removeItem('pollingStartTime');
      sessionStorage.removeItem('currentOrderId');
      sessionStorage.removeItem('isWaitingForNewReport');
    }
  }, [isFromHistory]);

  useEffect(() => {
    if (user?.email && userId !== user.email) {
      setUserId(user.email);
      localStorage.removeItem('temp_user_id');
    }
  }, [user, userId]);

  // CRITICAL: Don't show old reports when waiting for a new report
  const allReports = (isWaitingForNewReport || isLoadingReport) ? [] : (gptReport ? [gptReport, ...pastReports] : []);
  const displayReport = allReports[selectedReportIndex] || null;

  const fetchPastReports = useCallback(async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/get-report`;

      const targetUserId = isFromHistory && historySendUserId ? historySendUserId : userId;
      const params = new URLSearchParams({ userId: targetUserId, all: 'true' });

      console.log('📊 Fetching past reports for userId:', targetUserId, 'isFromHistory:', isFromHistory);

      const response = await fetch(`${apiUrl}?${params}`);
      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching past reports:', result.error);
        return;
      }

      if (result.data) {
        setPastReports(result.data.map((item: any) => item.report_data as GPTReport));
        console.log('✅ Found', result.data.length, 'past reports');
      }
    } catch (error) {
      console.error('Error fetching past reports:', error);
    }
  }, [userId, isFromHistory, historySendUserId]);

  const fetchReportFromSupabase = useCallback(async () => {
    try {
      console.log('📊 Fetching report from Edge Function for userId:', userId);
      console.log('📊 Order ID:', currentOrderId);
      console.log('📊 Polling start time:', pollingStartTime);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/get-report`;

      const params = new URLSearchParams({ userId });
      if (currentOrderId) {
        params.append('orderId', currentOrderId);
      }
      if (pollingStartTime) {
        params.append('pollingStartTime', pollingStartTime);
      }

      const response = await fetch(`${apiUrl}?${params}`);
      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error fetching report:', result.error);
        return null;
      }

      const data = result.data;

      if (data && data.report_data) {
        console.log('✅ Report found!', data);
        console.log('📋 Report order_number:', data.order_number);
        console.log('📋 Expected order_number:', currentOrderId);
        console.log('📋 Report created_at:', data.created_at);
        console.log('📋 Report updated_at:', data.updated_at);
        console.log('📋 Polling start time:', pollingStartTime);

        // CRITICAL: If we're polling for a specific order, the report MUST have that order number
        if (currentOrderId) {
          if (!data.order_number) {
            console.log('⚠️ Report has no order_number but we are polling for order:', currentOrderId);
            console.log('⚠️ This is an old report without order tracking. Ignoring.');
            return null;
          }
          if (data.order_number !== currentOrderId) {
            console.log('⚠️ Order number mismatch! Expected:', currentOrderId, 'Got:', data.order_number);
            console.log('⚠️ Ignoring this report - it belongs to a different order.');
            return null;
          }
        }

        // CRITICAL: If we're polling (have a start time), only accept reports updated AFTER polling started
        if (pollingStartTime) {
          if (!data.updated_at) {
            console.log('⚠️ Report has no updated_at timestamp! Ignoring.');
            return null;
          }
          const reportTime = new Date(data.updated_at).getTime();
          const startTime = new Date(pollingStartTime).getTime();
          console.log('📊 Comparing times:', {
            reportTime: new Date(data.updated_at).toISOString(),
            startTime: new Date(pollingStartTime).toISOString(),
            reportIsNewer: reportTime >= startTime,
            difference: `${(reportTime - startTime) / 1000} seconds`
          });
          if (reportTime < startTime) {
            console.log('⚠️ Report was updated BEFORE polling started! This is old data.');
            console.log('⚠️ Ignoring to prevent showing stale results.');
            return null;
          }
        }

        console.log('✅ Report validation passed!');
        setGptReport(data.report_data as GPTReport);
        setSelectedReportIndex(0);
        setIsLoadingReport(false);
        sessionStorage.removeItem('isLoadingReport');
        sessionStorage.removeItem('pollingStartTime');
        sessionStorage.removeItem('currentOrderId');
        sessionStorage.removeItem('isWaitingForNewReport');
        setIsWaitingForNewReport(false);
        return data.report_data;
      } else {
        console.log('⏳ No report found yet...');
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching report:', error);
      return null;
    }
  }, [userId, currentOrderId, pollingStartTime]);

  useEffect(() => {
    if (isFromHistory && !isWaitingForNewReport && !historyGptReport) {
      fetchPastReports();
    }
  }, [isFromHistory, isWaitingForNewReport, historyGptReport, fetchPastReports]);

  useEffect(() => {
    if (isLoadingReport && pollingStartTime && currentOrderId) {
      console.log('🔄 Resuming polling after page refresh...');
      const pollInterval = setInterval(async () => {
        const report = await fetchReportFromSupabase();
        if (report) {
          console.log('✅ Report polling completed successfully');
          clearInterval(pollInterval);
          sessionStorage.removeItem('isLoadingReport');
          sessionStorage.removeItem('pollingStartTime');
          sessionStorage.removeItem('currentOrderId');
          sessionStorage.removeItem('isWaitingForNewReport');
          setIsWaitingForNewReport(false);
          fetchPastReports();
          if (onHistoryRefresh) {
            console.log('🔄 Triggering history refresh...');
            onHistoryRefresh();
          }
        }
      }, 3000);

      const startTime = new Date(pollingStartTime).getTime();
      const elapsed = Date.now() - startTime;
      const remaining = 120000 - elapsed;

      if (remaining > 0) {
        setTimeout(() => {
          console.log('⏱️ Polling timeout reached (120 seconds)');
          clearInterval(pollInterval);
          if (!gptReport) {
            console.log('❌ No report received within timeout period');
            setIsLoadingReport(false);
            sessionStorage.removeItem('isLoadingReport');
            sessionStorage.removeItem('pollingStartTime');
            sessionStorage.removeItem('currentOrderId');
            sessionStorage.removeItem('isWaitingForNewReport');
            setIsWaitingForNewReport(false);
            alert('レポートの生成に時間がかかっています。しばらくしてからもう一度お試しください。');
          }
        }, remaining);
      } else {
        clearInterval(pollInterval);
        setIsLoadingReport(false);
        sessionStorage.removeItem('isLoadingReport');
        sessionStorage.removeItem('pollingStartTime');
        sessionStorage.removeItem('currentOrderId');
        sessionStorage.removeItem('isWaitingForNewReport');
        setIsWaitingForNewReport(false);
      }

      return () => clearInterval(pollInterval);
    }
  }, [isLoadingReport, pollingStartTime, currentOrderId, gptReport, fetchReportFromSupabase, fetchPastReports, onHistoryRefresh]);

  const handleSendToMake = async (orderId: string) => {
    const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;

    console.log('=== Make送信デバッグ ===');
    console.log('Webhook URL:', webhookUrl);
    console.log('Order ID:', orderId);
    console.log('User ID:', userId);

    if (!webhookUrl || webhookUrl === 'YOUR_MAKE_WEBHOOK_URL_HERE') {
      console.error('Webhook URL is not configured');
      setSendStatus('error');
      setIsSending(false);
      setOrderError('Webhook URLが設定されていません。環境変数を確認してください。');
      return;
    }

    console.log('🧹 Clearing all previous report data before sending...');
    setPastReports([]);
    setGptReport(null);
    setSelectedReportIndex(0);

    setIsSending(true);
    setSendStatus('idle');
    setIsWaitingForNewReport(true);
    sessionStorage.setItem('isWaitingForNewReport', 'true');

    const normalizeScoreForWebhook = (score: number): number => {
      return Math.round(Math.max(0, Math.min(100, ((score + 100) / 2))));
    };

    const tarotCard = result.tarotCard || selectTarotCard(result.type, result.scores);
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
      console.log('💾 先に診断履歴を保存します...');
      await saveDiagnosisHistory(profile, result, userId, orderId);
      console.log('✅ 診断履歴を保存しました');

      console.log('📤 Makeにデータを送信中...');
      console.log('送信先URL:', webhookUrl);
      console.log('送信データ:', JSON.stringify(dataToSend, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(dataToSend),
      });

      console.log('📥 Makeからの応答:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Array.from(response.headers.entries())
      });

      if (response.ok) {
        const responseText = await response.text();
        console.log('📄 レスポンステキスト:', responseText);

        let responseData;
        try {
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error('❌ JSON解析エラー:', parseError);
          console.log('受信した生データ:', responseText);
          responseData = {};
        }

        console.log('✅ Make response:', responseData);

        if (response.status === 200) {
          setSendStatus('success');
          console.log('✅ Makeへの送信成功 - データ処理中');
          alert('データを送信しました。レポート生成中です...');
          setShowOrderInput(false);
          setOrderNumber('');
          setOrderError('');
          setIsLoadingReport(true);
          startReportPolling();
        } else if (responseData.orderValid === true && responseData.success === true) {
          setSendStatus('success');
          console.log('Order validated successfully');
          alert('番号を確認できました　そのままお待ちください');
          setShowOrderInput(false);
          setOrderNumber('');
          setOrderError('');
          setIsLoadingReport(true);
          startReportPolling();
        } else {
          setSendStatus('error');
          setOrderError(responseData.message || 'オーダー番号が見つかりません');
          setOrderNumber('');
        }
      } else {
        const errorText = await response.text().catch(() => '');
        setSendStatus('error');
        console.error('❌ Makeへの送信失敗:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        setOrderError(`送信に失敗しました (${response.status})。\n詳細: ${errorText || response.statusText}\nMakeのシナリオが有効か確認してください。`);
      }
    } catch (error) {
      console.error('❌ ネットワークエラー:', error);
      if (error instanceof TypeError) {
        console.error('これはネットワーク接続の問題かCORSエラーです');
      }
      setSendStatus('error');
      setOrderError('ネットワークエラーが発生しました。接続を確認してください。');
    } finally {
      setIsSending(false);
    }
  };

  const handleUnlockResults = () => {
    if (!user) {
      sessionStorage.setItem('pendingDiagnosisResult', JSON.stringify({
        profile,
        result,
        returnToResults: true
      }));
      navigate('/login');
      return;
    }

    console.log('🧹 Clearing all report data when opening order input...');
    setPastReports([]);
    setGptReport(null);
    setSelectedReportIndex(0);

    setShowOrderInput(true);
    setOrderError('');
    setOrderNumber('');
  };

  const handleOrderSubmit = () => {
    if (!orderNumber.trim()) {
      setOrderError('オーダー番号を入力してください');
      return;
    }

    console.log('🧹 Clearing all report data before order submit...');
    setPastReports([]);
    setGptReport(null);
    setSelectedReportIndex(0);

    setOrderError('');
    setCurrentOrderId(orderNumber);
    sessionStorage.setItem('currentOrderId', orderNumber);
    setIsLoadingReport(true);
    sessionStorage.setItem('isLoadingReport', 'true');
    setIsWaitingForNewReport(true);
    sessionStorage.setItem('isWaitingForNewReport', 'true');
    handleSendToMake(orderNumber);
  };

  const startReportPolling = () => {
    const startTime = new Date().toISOString();
    console.log('🔄 Starting report polling...');
    console.log('👤 User ID:', userId);
    console.log('📋 Order ID:', currentOrderId);
    console.log('⏰ Start time:', startTime);

    console.log('🧹 Clearing all report data at polling start...');
    setPastReports([]);
    setGptReport(null);
    setSelectedReportIndex(0);

    setIsLoadingReport(true);
    sessionStorage.setItem('isLoadingReport', 'true');
    setPollingStartTime(startTime);
    sessionStorage.setItem('pollingStartTime', startTime);

    const pollInterval = setInterval(async () => {
      const report = await fetchReportFromSupabase();
      if (report) {
        console.log('✅ Report polling completed successfully');
        clearInterval(pollInterval);
        sessionStorage.removeItem('isLoadingReport');
        sessionStorage.removeItem('pollingStartTime');
        sessionStorage.removeItem('currentOrderId');
        sessionStorage.removeItem('isWaitingForNewReport');
        setIsWaitingForNewReport(false);
        fetchPastReports();
        if (onHistoryRefresh) {
          console.log('🔄 Triggering history refresh...');
          onHistoryRefresh();
        }
      }
    }, 3000);

    setTimeout(() => {
      console.log('⏱️ Polling timeout reached (120 seconds)');
      clearInterval(pollInterval);
      if (!gptReport) {
        console.log('❌ No report received within timeout period');
        setIsLoadingReport(false);
        sessionStorage.removeItem('isLoadingReport');
        sessionStorage.removeItem('pollingStartTime');
        sessionStorage.removeItem('currentOrderId');
        sessionStorage.removeItem('isWaitingForNewReport');
        setIsWaitingForNewReport(false);
        alert('レポートの生成に時間がかかっています。しばらくしてからもう一度お試しください。');
      }
    }, 120000);
  };

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
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 pb-16 sm:pb-20">
        <div className="max-w-4xl w-full relative rounded-lg" style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(15px)',
        }}>
        <div className="relative z-10 space-y-5 sm:space-y-6 md:space-y-8 py-12 px-6 sm:px-8 md:px-12 pb-16 sm:pb-20">
        <div className="rounded-lg p-6 sm:p-8 md:p-12 lg:p-16 text-center relative luxurious-result-bg">
          <div className="decorative-corners"></div>
          <div className="seigaiha-pattern"></div>
          <div className="shimmer-overlay"></div>
          <div className="floating-lights">
            <div className="floating-light"></div>
            <div className="floating-light"></div>
            <div className="floating-light"></div>
            <div className="floating-light"></div>
            <div className="floating-light"></div>
            <div className="floating-light"></div>
          </div>
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

              {['ENFP', 'ENFJ', 'ENTJ', 'ENTJ-A', 'ENTP', 'ESFP', 'ESFJ', 'ESTP', 'ESTJ', 'INFP', 'INFJ', 'INTJ', 'INTP', 'ISFP', 'ISFJ', 'ISTP', 'ISTJ'].includes(result.type) && (
                <div className="mb-4">
                  <img
                    src={`/${result.type.toLowerCase()}.gif`}
                    alt={result.type}
                    className="mx-auto"
                    style={{
                      width: '320px',
                      height: '280px',
                      filter: 'drop-shadow(0 0 20px rgba(191, 167, 110, 0.6))',
                    }}
                  />
                </div>
              )}

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
              <RadarChart data={radarData} size={isMobile ? 250 : 300} />
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

        <div className="relative p-5 sm:p-6 md:p-8 rounded-lg">
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-center" style={{ color: 'var(--pale-gold)' }}>
              神託札（タロット）
            </h3>
            <p className="text-center text-sm opacity-70 mb-6" style={{ color: 'var(--pale-light)' }}>
              汝の魂に宿る札の啓示
            </p>

            {(() => {
              const tarotCard = result.tarotCard || selectTarotCard(result.type, result.scores);
              return (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <img
                        src={`/${tarotCard.id}_-_${tarotCard.name}(${tarotCard.originalName}).png`}
                        alt={tarotCard.name}
                        className="mx-auto rounded-lg"
                        style={{
                          width: '280px',
                          height: 'auto',
                          filter: 'drop-shadow(0 0 30px rgba(166, 124, 82, 0.6))',
                          border: '3px solid rgba(166, 124, 82, 0.7)',
                        }}
                      />
                      <div className="text-center mt-4">
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

                  {displayReport?.tarotExplanation && (
                    <div className="p-4 rounded-lg" style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(122, 29, 46, 0.3))',
                      border: '2px solid rgba(166, 124, 82, 0.5)',
                    }}>
                      <div className="text-sm font-bold mb-2 text-center" style={{ color: 'var(--pale-gold)' }}>
                        神託の解釈
                      </div>
                      <p className="text-sm leading-relaxed opacity-90 text-center" style={{ color: 'var(--pale-light)' }}>
                        {displayReport.tarotExplanation}
                      </p>
                    </div>
                  )}

                  {isLoadingReport && !displayReport?.tarotExplanation && (
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
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{
                      borderColor: 'rgba(191, 167, 110, 0.3)',
                      borderTopColor: 'transparent',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <div className="absolute inset-3 border-4 border-b-transparent rounded-full animate-spin" style={{
                      borderColor: 'rgba(166, 124, 82, 0.5)',
                      borderBottomColor: 'transparent',
                      animation: 'spin 1.5s linear infinite reverse'
                    }}></div>
                  </div>
                  <p className="text-lg font-medium glow-text" style={{ color: 'var(--pale-gold)' }}>神託を読み解いています...</p>
                  <p className="text-sm opacity-70">約3分ほどお待ちください</p>
                </div>
              ) : displayReport?.section1?.content ? (
                <p>{displayReport.section1.content}</p>
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
                        className="flex flex-col items-center gap-2 p-4 rounded-lg transition-transform hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.3), rgba(166, 124, 82, 0.2))',
                          border: '2px solid rgba(166, 124, 82, 0.4)',
                        }}
                      >
                        <p className="text-xs font-semibold opacity-80" style={{ color: 'var(--pale-gold)' }}>
                          {typeCode}
                        </p>
                        <div
                          className="w-20 h-20 rounded-full border-2 border-amber-700/50 flex items-center justify-center overflow-hidden"
                          style={{
                            boxShadow: '0 4px 10px rgba(166, 124, 82, 0.3)',
                            background: 'linear-gradient(135deg, rgba(166, 124, 82, 0.2), rgba(107, 68, 35, 0.1))',
                          }}
                        >
                          <img
                            src={`/${typeCode.toLowerCase()}.gif`}
                            alt={typeCode}
                            className="w-full h-full object-cover"
                          />
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
                        className="flex flex-col items-center gap-2 p-4 rounded-lg transition-transform hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, rgba(122, 29, 46, 0.3), rgba(78, 0, 21, 0.2))',
                          border: '2px solid rgba(122, 29, 46, 0.4)',
                        }}
                      >
                        <p className="text-xs font-semibold opacity-80" style={{ color: 'var(--pale-gold)' }}>
                          {typeCode}
                        </p>
                        <div
                          className="w-20 h-20 rounded-full border-2 border-red-800/50 flex items-center justify-center overflow-hidden"
                          style={{
                            boxShadow: '0 4px 10px rgba(122, 29, 46, 0.3)',
                            background: 'linear-gradient(135deg, rgba(122, 29, 46, 0.2), rgba(78, 0, 21, 0.1))',
                          }}
                        >
                          <img
                            src={`/${typeCode.toLowerCase()}.gif`}
                            alt={typeCode}
                            className="w-full h-full object-cover"
                          />
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
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{
                      borderColor: 'rgba(191, 167, 110, 0.3)',
                      borderTopColor: 'transparent',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                    命式を読み解いています...
                  </p>
                </div>
              ) : displayReport?.fourPillars ? (
                <>
                  <div className="mb-4 p-4 rounded-lg" style={{
                    background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.2), rgba(122, 29, 46, 0.2))',
                    border: '1px solid rgba(166, 124, 82, 0.3)',
                  }}>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
                      <div>
                        <div className="font-bold mb-1" style={{ color: 'var(--pale-gold)' }}>年柱</div>
                        <div style={{ color: 'var(--pale-light)' }}>{displayReport.fourPillars.chart.year.天干}</div>
                        <div style={{ color: 'var(--pale-light)' }}>{displayReport.fourPillars.chart.year.地支}</div>
                      </div>
                      <div>
                        <div className="font-bold mb-1" style={{ color: 'var(--pale-gold)' }}>月柱</div>
                        <div style={{ color: 'var(--pale-light)' }}>{displayReport.fourPillars.chart.month.天干}</div>
                        <div style={{ color: 'var(--pale-light)' }}>{displayReport.fourPillars.chart.month.地支}</div>
                      </div>
                      <div>
                        <div className="font-bold mb-1" style={{ color: 'var(--pale-gold)' }}>日柱</div>
                        <div style={{ color: 'var(--pale-light)' }}>{displayReport.fourPillars.chart.day.天干}</div>
                        <div style={{ color: 'var(--pale-light)' }}>{displayReport.fourPillars.chart.day.地支}</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90 mb-4" style={{ color: 'var(--pale-light)' }}>
                    {displayReport.fourPillars.basic}
                  </p>
                  {displayReport.fourPillars.charts && displayReport.fourPillars.charts.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-2 mb-4 justify-items-center">
                      {displayReport.fourPillars.charts.map((chart, index) => (
                        <CircularChart key={index} percentage={chart.value} label={chart.title} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                  四柱推命による運命分析がすべて開放後に生成されます
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
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{
                      borderColor: 'rgba(191, 167, 110, 0.3)',
                      borderTopColor: 'transparent',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <div className="absolute inset-3 border-4 border-b-transparent rounded-full animate-spin" style={{
                      borderColor: 'rgba(166, 124, 82, 0.5)',
                      borderBottomColor: 'transparent',
                      animation: 'spin 1.5s linear infinite reverse'
                    }}></div>
                  </div>
                  <p className="text-lg font-medium glow-text" style={{ color: 'var(--pale-gold)' }}>分析中...</p>
                  <p className="text-sm opacity-70">約3分ほどお待ちください</p>
                </div>
              ) : displayReport?.section2?.content ? (
                <p>{displayReport.section2.content}</p>
              ) : (
                <p>あなたのキャリアパスと成功への道筋について分析した内容がここに表示されます。</p>
              )}
            </div>

            {displayReport?.section2?.charts && displayReport.section2.charts.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>成果を動かす因子（キャリア加速パラメータ）</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {displayReport.section2.charts.map((chart, index) => (
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

            {displayReport?.section2?.items && displayReport.section2.items.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>詳細分析</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayReport.section2.items.map((item, index) => (
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
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{
                      borderColor: 'rgba(191, 167, 110, 0.3)',
                      borderTopColor: 'transparent',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <div className="absolute inset-3 border-4 border-b-transparent rounded-full animate-spin" style={{
                      borderColor: 'rgba(166, 124, 82, 0.5)',
                      borderBottomColor: 'transparent',
                      animation: 'spin 1.5s linear infinite reverse'
                    }}></div>
                  </div>
                  <p className="text-lg font-medium glow-text" style={{ color: 'var(--pale-gold)' }}>分析中...</p>
                  <p className="text-sm opacity-70">約3分ほどお待ちください</p>
                </div>
              ) : displayReport?.section3?.content ? (
                <p>{displayReport.section3.content}</p>
              ) : (
                <p>あなたの成長可能性と自己改善の方向性について分析した内容がここに表示されます。</p>
              )}
            </div>

            {displayReport?.section3?.charts && displayReport.section3.charts.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>成長パラメータ</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {displayReport.section3.charts.map((chart, index) => (
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

            {displayReport?.section3?.items && displayReport.section3.items.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>自己進化の指針</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayReport.section3.items.map((item, index) => (
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

            {displayReport?.astrology && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>星辰占（西洋占星術）</h4>
                <p className="text-sm leading-relaxed opacity-90" style={{ color: 'var(--pale-light)' }}>
                  {displayReport.astrology}
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
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{
                      borderColor: 'rgba(191, 167, 110, 0.3)',
                      borderTopColor: 'transparent',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <div className="absolute inset-3 border-4 border-b-transparent rounded-full animate-spin" style={{
                      borderColor: 'rgba(166, 124, 82, 0.5)',
                      borderBottomColor: 'transparent',
                      animation: 'spin 1.5s linear infinite reverse'
                    }}></div>
                  </div>
                  <p className="text-lg font-medium glow-text" style={{ color: 'var(--pale-gold)' }}>分析中...</p>
                  <p className="text-sm opacity-70">約3分ほどお待ちください</p>
                </div>
              ) : displayReport?.section4?.content ? (
                <p>{displayReport.section4.content}</p>
              ) : (
                <p>あなたの対人関係スタイルとコミュニケーション特性について分析した内容がここに表示されます。</p>
              )}
            </div>

            {displayReport?.section4?.charts && displayReport.section4.charts.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>関係構築の武器（信頼生成スキル）</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {displayReport.section4.charts.map((chart, index) => (
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

            {displayReport?.section4?.items && displayReport.section4.items.length > 0 && (
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--pale-gold)' }}>対人ダイナミクスの詳細</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayReport.section4.items.map((item, index) => (
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

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5">
            {!displayReport && (
              <button
                onClick={handleUnlockResults}
                className="mystic-button flex-1 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base px-6 py-3 sm:py-4"
              >
                <span>全ての結果を開放する</span>
              </button>
            )}

            <button
              onClick={onRestart}
              className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded transition-all duration-300 hover:scale-105 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(40, 30, 20, 0.95), rgba(30, 20, 15, 0.95))',
                border: '2px solid rgba(80, 60, 40, 0.8)',
                color: '#f5f5dc',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
              }}
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

          {showOrderInput && (
            <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-lg" style={{
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
              <p className="text-sm sm:text-base mb-4 text-center leading-relaxed" style={{ color: 'var(--pale-light)' }}>
                例：1019088409
              </p>

              <div className="mb-6 text-center">
                <p className="text-sm mb-3" style={{ color: 'var(--pale-light)' }}>
                  まだ購入していない方はこちらから
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
          )}
        </div>


        <div className="text-center flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/all-types')}
            className="inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-lg text-base sm:text-lg font-bold transition-all duration-300 hover:scale-105 glow-text"
            style={{
              background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.3), rgba(166, 124, 82, 0.2))',
              border: '2px solid rgba(166, 124, 82, 0.6)',
              color: 'var(--pale-gold)',
              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(191, 167, 110, 0.3)',
            }}
          >
            <Users size={24} className="sm:w-7 sm:h-7" />
            <span>全17タイプ一覧</span>
          </button>
          <button
            onClick={() => navigate('/tarot-cards')}
            className="inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-lg text-base sm:text-lg font-bold transition-all duration-300 hover:scale-105 glow-text"
            style={{
              background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.3), rgba(166, 124, 82, 0.2))',
              border: '2px solid rgba(166, 124, 82, 0.6)',
              color: 'var(--pale-gold)',
              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(191, 167, 110, 0.3)',
            }}
          >
            <BookOpen size={24} className="sm:w-7 sm:h-7" />
            <span>すべてのタロットを見る</span>
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
