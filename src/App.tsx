import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Target, AlertTriangle, LogIn, UserPlus, LogOut, User, Users } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { LoginScreen } from './components/auth/LoginScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { ResultScreen } from './components/ResultScreen';
import { DiagnosisHistoryList } from './components/DiagnosisHistoryList';
import { AllTypesScreen } from './components/AllTypesScreen';
import { AllTarotCardsScreen } from './components/AllTarotCardsScreen';
import { Profile, Answer, DiagnosisResult } from './types';
import { getDiagnosisResult } from './utils/diagnosis';
import { saveDiagnosisHistory } from './lib/diagnosisHistory';
import { hasSupabaseConfig } from './lib/supabase';

type Screen = 'landing' | 'profile' | 'questions' | 'result';

const pageVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(10px)',
    transition: {
      duration: 0.5,
    },
  },
};

function DiagnosisApp() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isFromHistory, setIsFromHistory] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const pendingData = sessionStorage.getItem('pendingDiagnosisResult');
      if (pendingData) {
        try {
          const { profile: savedProfile, result: savedResult } = JSON.parse(pendingData);
          setProfile(savedProfile);
          setResult(savedResult);
          setIsFromHistory(false);
          setCurrentScreen('result');
          sessionStorage.removeItem('pendingDiagnosisResult');
        } catch (error) {
          console.error('Failed to restore diagnosis result:', error);
          sessionStorage.removeItem('pendingDiagnosisResult');
        }
      }
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    handleRestart();
  };

  const handleProfileComplete = (profileData: Profile) => {
    setProfile(profileData);
    setCurrentScreen('questions');
  };

  const handleQuestionsComplete = async (answers: Answer[]) => {
    if (isSaving) return;

    const diagnosisResult = getDiagnosisResult(answers);
    setResult(diagnosisResult);
    setIsFromHistory(false);

    if (profile) {
      setIsSaving(true);
      await saveDiagnosisHistory(profile, diagnosisResult);
      setIsSaving(false);
    }

    setCurrentScreen('result');
  };

  const handleRestart = () => {
    setProfile(null);
    setResult(null);
    setIsFromHistory(false);
    setIsSaving(false);
    setHistoryRefreshKey(prev => prev + 1);
    setCurrentScreen('landing');
  };

  const handleSelectHistory = (historyProfile: Profile, historyResult: DiagnosisResult) => {
    setProfile(historyProfile);
    setResult(historyResult);
    setIsFromHistory(true);
    setCurrentScreen('result');
  };

  return (
    <AnimatePresence mode="wait">
      {currentScreen === 'profile' && (
        <motion.div
          key="profile"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <ProfileScreen onComplete={handleProfileComplete} />
        </motion.div>
      )}

      {currentScreen === 'questions' && (
        <motion.div
          key="questions"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <QuestionScreen onComplete={handleQuestionsComplete} />
        </motion.div>
      )}

      {currentScreen === 'result' && result && profile && (
        <motion.div
          key="result"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <ResultScreen result={result} profile={profile} onRestart={handleRestart} isFromHistory={isFromHistory} />
        </motion.div>
      )}

      {currentScreen === 'landing' && (
        <motion.div
          key="landing"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen flex items-center justify-center px-4 sm:px-4 py-8 sm:py-12"
        >
          <div className="mystical-spores">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="spore" />
            ))}
          </div>
          <div className="landing-border max-w-3xl w-full rounded-lg p-3 sm:p-8 md:p-12 lg:p-16 relative">
            <div className="relative z-10">
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto mb-6 sm:mb-8 relative" style={{
                filter: 'drop-shadow(0 0 30px rgba(166, 124, 82, 0.5))',
                border: '3px solid rgba(166, 124, 82, 0.6)',
                borderRadius: '50%',
                boxShadow: '0 0 20px rgba(166, 124, 82, 0.4), inset 0 0 20px rgba(166, 124, 82, 0.1)',
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.3)'
              }}>
                <img
                  src="/a_mystical_and_adorable_shrine_mascot_character_de-1767804824217.png"
                  alt="神社のマスコット"
                  className="w-full h-full object-contain"
                  style={{ borderRadius: '50%' }}
                />
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 glow-text" style={{
                color: '#FFE4A0',
                textShadow: '0 0 20px rgba(255, 228, 160, 0.9), 0 0 40px rgba(255, 228, 160, 0.7), 0 0 60px rgba(255, 228, 160, 0.5), 0 4px 8px rgba(0, 0, 0, 0.9)',
                fontWeight: '900'
              }}>
                七軸十七類診断
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 glow-text font-bold" style={{
                color: '#FFF8E1',
                textShadow: '0 0 25px rgba(255, 248, 225, 1), 0 0 50px rgba(255, 248, 225, 0.8), 0 0 75px rgba(255, 248, 225, 0.6), 0 4px 10px rgba(0, 0, 0, 0.95)',
                fontWeight: '800',
                letterSpacing: '0.05em'
              }}>
                ─ セプテード診断 ─
              </p>

              <div className="max-w-xl mx-auto space-y-3 sm:space-y-4">
                <p className="text-lg sm:text-xl leading-relaxed" style={{ color: 'var(--pale-light)' }}>
                  終わりゆく世界の残滓にて
                </p>

                <p className="text-base sm:text-lg opacity-95 leading-loose" style={{ color: 'var(--pale-light)' }}>
                  かつて繁栄せし文明は朽ち果て、<br />
                  静寂に包まれし廃墟の中に、汝は立つ。<br />
                  <br />
                  百の問いを経て、<br className="sm:hidden" />魂の真の姿が明かされん。<br />
                  十七の型に分かたれし者の内、<br />
                  汝はいずれの道を歩む者なりや。
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
              <div className="text-center p-4 sm:p-6">
                <Sparkles
                  size={36}
                  className="mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12"
                  style={{
                    color: 'var(--pale-gold)',
                    filter: 'drop-shadow(0 0 8px rgba(191, 167, 110, 0.8)) drop-shadow(0 0 16px rgba(191, 167, 110, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))'
                  }}
                />
                <h3 className="font-bold mb-2 sm:mb-3 text-base sm:text-lg md:text-xl glow-text" style={{ color: 'var(--pale-gold)' }}>百問の巡礼</h3>
                <p className="text-sm sm:text-base leading-relaxed glow-text font-medium" style={{ color: 'var(--pale-light)' }}>
                  魂の奥底を照らす<br />百の問いかけ
                </p>
              </div>

              <div className="text-center p-4 sm:p-6">
                <BookOpen
                  size={36}
                  className="mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12"
                  style={{
                    color: 'var(--pale-gold)',
                    filter: 'drop-shadow(0 0 8px rgba(191, 167, 110, 0.8)) drop-shadow(0 0 16px rgba(191, 167, 110, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))'
                  }}
                />
                <h3 className="font-bold mb-2 sm:mb-3 text-base sm:text-lg md:text-xl glow-text" style={{ color: 'var(--pale-gold)' }}>十七の型</h3>
                <p className="text-sm sm:text-base leading-relaxed glow-text font-medium" style={{ color: 'var(--pale-light)' }}>
                  古の叡智により<br />分類される魂の形
                </p>
              </div>

              <div className="text-center p-4 sm:p-6">
                <Target
                  size={36}
                  className="mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12"
                  style={{
                    color: 'var(--pale-gold)',
                    filter: 'drop-shadow(0 0 8px rgba(191, 167, 110, 0.8)) drop-shadow(0 0 16px rgba(191, 167, 110, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))'
                  }}
                />
                <h3 className="font-bold mb-2 sm:mb-3 text-base sm:text-lg md:text-xl glow-text" style={{ color: 'var(--pale-gold)' }}>真実の顕現</h3>
                <p className="text-sm sm:text-base leading-relaxed glow-text font-medium" style={{ color: 'var(--pale-light)' }}>
                  隠された特性が<br />図として現れる
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentScreen('profile')}
                className="mystic-button text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                運命の扉を開く
              </button>

              <p className="text-xs sm:text-sm mt-4 sm:mt-6 glow-text" style={{ color: 'var(--pale-light)', opacity: 0.85 }}>
                ─ 所要刻：約十五分 ─
              </p>
            </div>

            <div className="mt-8 sm:mt-12">
              <DiagnosisHistoryList refreshTrigger={historyRefreshKey} onSelectHistory={handleSelectHistory} />
            </div>

            <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/all-types')}
                className="mystic-button inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
              >
                <Users size={20} className="sm:w-6 sm:h-6" />
                <span>全17タイプを見る</span>
              </button>
              <button
                onClick={() => navigate('/tarot-cards')}
                className="mystic-button inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
              >
                <BookOpen size={20} className="sm:w-6 sm:h-6" />
                <span>すべてのタロットを見る</span>
              </button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 rounded" style={{
                    background: 'rgba(107, 68, 35, 0.3)',
                    border: '1px solid rgba(166, 124, 82, 0.4)',
                    color: 'var(--pale-gold)'
                  }}>
                    <User size={16} />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 rounded transition-all hover:scale-105"
                    style={{
                      background: 'rgba(122, 29, 46, 0.3)',
                      border: '1px solid rgba(122, 29, 46, 0.4)',
                      color: 'var(--pale-light)'
                    }}
                  >
                    <LogOut size={16} />
                    <span className="text-sm">ログアウト</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-4 py-2 rounded transition-all hover:scale-105"
                    style={{
                      background: 'rgba(107, 68, 35, 0.3)',
                      border: '1px solid rgba(166, 124, 82, 0.4)',
                      color: 'var(--pale-light)'
                    }}
                  >
                    <LogIn size={16} />
                    <span className="text-sm">ログイン</span>
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="flex items-center gap-2 px-4 py-2 rounded transition-all hover:scale-105"
                    style={{
                      background: 'rgba(107, 68, 35, 0.3)',
                      border: '1px solid rgba(166, 124, 82, 0.4)',
                      color: 'var(--pale-light)'
                    }}
                  >
                    <UserPlus size={16} />
                    <span className="text-sm">サインアップ</span>
                  </button>
                </>
              )}
            </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfigErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full rounded-lg p-8" style={{
        background: 'linear-gradient(135deg, rgba(20, 15, 10, 0.95), rgba(30, 20, 15, 0.92))',
        border: '2px solid rgba(166, 124, 82, 0.6)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      }}>
        <div className="text-center">
          <AlertTriangle
            size={64}
            className="mx-auto mb-6"
            style={{
              color: 'var(--torii-red)',
              filter: 'drop-shadow(0 0 10px rgba(122, 29, 46, 0.8))'
            }}
          />
          <h1 className="text-3xl font-bold mb-4 glow-text" style={{ color: 'var(--pale-gold)' }}>
            環境変数が設定されていません
          </h1>
          <div className="text-left space-y-4" style={{ color: 'var(--pale-light)' }}>
            <p>
              このアプリケーションを動作させるには、Vercelの環境変数を設定する必要があります。
            </p>
            <div className="p-4 rounded" style={{
              background: 'rgba(107, 68, 35, 0.3)',
              border: '1px solid rgba(166, 124, 82, 0.4)'
            }}>
              <h3 className="font-bold mb-2" style={{ color: 'var(--ochre)' }}>設定手順：</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Vercelダッシュボードでプロジェクトを開く</li>
                <li>Settings → Environment Variables に移動</li>
                <li>以下の環境変数を追加：
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1" style={{ color: 'var(--dim-light)' }}>
                    <li>VITE_SUPABASE_URL</li>
                    <li>VITE_SUPABASE_ANON_KEY</li>
                    <li>VITE_MAKE_WEBHOOK_URL</li>
                  </ul>
                </li>
                <li>プロジェクトを再デプロイ</li>
              </ol>
            </div>
            <p className="text-sm opacity-75">
              詳細はプロジェクトの <code style={{ color: 'var(--ochre)' }}>VERCEL_SETUP.md</code> ファイルを参照してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/reset" element={<ResetPasswordScreen />} />
          <Route path="/app" element={<DiagnosisApp />} />
          <Route path="/all-types" element={<AllTypesScreen />} />
          <Route path="/tarot-cards" element={<AllTarotCardsScreen />} />
          <Route path="/" element={<DiagnosisApp />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
