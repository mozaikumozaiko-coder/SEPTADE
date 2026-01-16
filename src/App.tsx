import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Target } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { LoginScreen } from './components/auth/LoginScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { ResultScreen } from './components/ResultScreen';
import { DiagnosisHistoryList } from './components/DiagnosisHistoryList';
import { Profile, Answer, DiagnosisResult } from './types';
import { getDiagnosisResult } from './utils/diagnosis';
import { supabase } from './lib/supabase';

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
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(10px)',
    transition: {
      duration: 0.5,
      ease: 'easeIn',
    },
  },
};

function DiagnosisApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isFromHistory, setIsFromHistory] = useState(false);

  const handleProfileComplete = (profileData: Profile) => {
    setProfile(profileData);
    setCurrentScreen('questions');
  };

  const saveReportToDatabase = async (
    profileData: Profile,
    diagnosisResult: DiagnosisResult,
    answers: Answer[]
  ) => {
    try {
      const reportData = {
        profile: profileData,
        result: diagnosisResult,
        answers: answers,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: `${profileData.name}_${Date.now()}`,
          report_data: reportData,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('診断結果の保存エラー:', error);
      } else {
        console.log('診断結果を保存しました:', data);
      }
    } catch (err) {
      console.error('診断結果の保存に失敗:', err);
    }
  };

  const handleQuestionsComplete = async (answers: Answer[]) => {
    const diagnosisResult = getDiagnosisResult(answers);
    setResult(diagnosisResult);
    setIsFromHistory(false);

    if (profile) {
      await saveReportToDatabase(profile, diagnosisResult, answers);
    }

    setCurrentScreen('result');
  };

  const handleRestart = () => {
    setProfile(null);
    setResult(null);
    setIsFromHistory(false);
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
          <div className="landing-border max-w-3xl w-full rounded-lg p-6 sm:p-8 md:p-12 lg:p-16 relative">
            <div className="relative z-10">
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-6 sm:mb-8 relative" style={{
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

              <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-3 glow-text" style={{ color: 'var(--pale-gold)' }}>
                七軸十七類診断
              </h1>

              <p className="text-2xl sm:text-2xl md:text-3xl mb-6 sm:mb-6 glow-text font-medium" style={{ color: 'var(--ochre)', opacity: 0.9 }}>
                ─ セプテード診断 ─
              </p>

              <div className="max-w-xl mx-auto space-y-4 sm:space-y-4">
                <p className="text-xl sm:text-xl leading-relaxed" style={{ color: 'var(--pale-light)' }}>
                  終わりゆく世界の残滓にて
                </p>

                <p className="text-lg sm:text-lg opacity-95 leading-loose" style={{ color: 'var(--pale-light)' }}>
                  かつて繁栄せし文明は朽ち果て、<br />
                  静寂に包まれし廃墟の中に、汝は立つ。<br />
                  <br />
                  百の問いを経て、魂の真の姿が明かされん。<br />
                  十七の型に分かたれし者の内、<br />
                  汝はいずれの道を歩む者なりや。
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 sm:gap-6 mb-8 sm:mb-10">
              <div className="text-center p-5 sm:p-6">
                <Sparkles
                  size={40}
                  className="mx-auto mb-4 sm:mb-4 sm:w-12 sm:h-12"
                  style={{
                    color: 'var(--pale-gold)',
                    filter: 'drop-shadow(0 0 8px rgba(191, 167, 110, 0.8)) drop-shadow(0 0 16px rgba(191, 167, 110, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))'
                  }}
                />
                <h3 className="font-bold mb-3 sm:mb-3 text-lg sm:text-lg md:text-xl glow-text" style={{ color: 'var(--pale-gold)' }}>百問の巡礼</h3>
                <p className="text-base sm:text-base leading-relaxed glow-text font-medium" style={{ color: 'var(--pale-light)' }}>
                  魂の奥底を照らす<br />百の問いかけ
                </p>
              </div>

              <div className="text-center p-5 sm:p-6">
                <BookOpen
                  size={40}
                  className="mx-auto mb-4 sm:mb-4 sm:w-12 sm:h-12"
                  style={{
                    color: 'var(--pale-gold)',
                    filter: 'drop-shadow(0 0 8px rgba(191, 167, 110, 0.8)) drop-shadow(0 0 16px rgba(191, 167, 110, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))'
                  }}
                />
                <h3 className="font-bold mb-3 sm:mb-3 text-lg sm:text-lg md:text-xl glow-text" style={{ color: 'var(--pale-gold)' }}>十七の型</h3>
                <p className="text-base sm:text-base leading-relaxed glow-text font-medium" style={{ color: 'var(--pale-light)' }}>
                  古の叡智により<br />分類される魂の形
                </p>
              </div>

              <div className="text-center p-5 sm:p-6">
                <Target
                  size={40}
                  className="mx-auto mb-4 sm:mb-4 sm:w-12 sm:h-12"
                  style={{
                    color: 'var(--pale-gold)',
                    filter: 'drop-shadow(0 0 8px rgba(191, 167, 110, 0.8)) drop-shadow(0 0 16px rgba(191, 167, 110, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))'
                  }}
                />
                <h3 className="font-bold mb-3 sm:mb-3 text-lg sm:text-lg md:text-xl glow-text" style={{ color: 'var(--pale-gold)' }}>真実の顕現</h3>
                <p className="text-base sm:text-base leading-relaxed glow-text font-medium" style={{ color: 'var(--pale-light)' }}>
                  隠された特性が<br />図として現れる
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentScreen('profile')}
                className="mystic-button text-base sm:text-base md:text-lg px-8 sm:px-8 py-4 sm:py-4"
              >
                運命の扉を開く
              </button>

              <p className="text-sm sm:text-sm mt-6 sm:mt-6 glow-text" style={{ color: 'var(--pale-light)', opacity: 0.85 }}>
                ─ 所要刻：約十五分 ─
              </p>
            </div>

            <div className="mt-8 sm:mt-12">
              <DiagnosisHistoryList onSelectHistory={handleSelectHistory} />
            </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <DiagnosisApp />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
