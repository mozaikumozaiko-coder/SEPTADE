import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw } from 'lucide-react';
import { DiagnosisResult, Profile, Answer } from '../types';
import { getDiagnosisResult } from '../utils/diagnosis';
import { ResultScreen } from './ResultScreen';

const MBTI_TYPES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'] as const;

const TYPE_NAMES: Record<typeof MBTI_TYPES[number], string> = {
  INTJ: '建築家',
  INTP: '論理学者',
  ENTJ: '指揮官',
  ENTP: '討論者',
  INFJ: '提唱者',
  INFP: '仲介者',
  ENFJ: '主人公',
  ENFP: '運動家',
  ISTJ: '管理者',
  ISFJ: '擁護者',
  ESTJ: '幹部',
  ESFJ: '領事官',
  ISTP: '巨匠',
  ISFP: '冒険家',
  ESTP: '起業家',
  ESFP: 'エンターテイナー',
};

function generateRandomAnswers(): Answer[] {
  return Array.from({ length: 100 }, (_, i) => ({
    questionIndex: i,
    value: Math.floor(Math.random() * 5) + 1,
  }));
}

function generateRandomProfile(): Profile {
  const names = ['太郎', '花子', '一郎', '美咲', '健太', 'さくら', '大輔', '愛'];
  const randomName = names[Math.floor(Math.random() * names.length)];

  const year = 1980 + Math.floor(Math.random() * 30);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const randomBirthdate = `${year}-${month}-${day}`;

  return {
    name: randomName,
    birthdate: randomBirthdate,
  };
}

export function TestDiagnosisScreen() {
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const runRandomDiagnosis = () => {
    setIsAnimating(true);
    const randomAnswers = generateRandomAnswers();
    const randomProfile = generateRandomProfile();
    const diagnosisResult = getDiagnosisResult(randomAnswers);

    setTimeout(() => {
      setResult(diagnosisResult);
      setProfile(randomProfile);
      setIsAnimating(false);
    }, 1000);
  };

  const runSpecificTypeDiagnosis = (targetType: typeof MBTI_TYPES[number]) => {
    setIsAnimating(true);
    const randomProfile = generateRandomProfile();

    let attempts = 0;
    let diagnosisResult: DiagnosisResult;

    do {
      const randomAnswers = generateRandomAnswers();
      diagnosisResult = getDiagnosisResult(randomAnswers);
      attempts++;
    } while (diagnosisResult.type !== targetType && attempts < 100);

    if (diagnosisResult.type !== targetType) {
      const eScore = targetType[0] === 'E' ? 50 : -50;
      const sScore = targetType[1] === 'S' ? 50 : -50;
      const tScore = targetType[2] === 'T' ? 50 : -50;
      const jScore = targetType[3] === 'J' ? 50 : -50;

      diagnosisResult = {
        type: targetType,
        typeName: TYPE_NAMES[targetType],
        scores: {
          E: eScore,
          S: sScore,
          T: tScore,
          J: jScore,
        },
      };
    }

    setTimeout(() => {
      setResult(diagnosisResult);
      setProfile(randomProfile);
      setIsAnimating(false);
    }, 1000);
  };

  const handleRestart = () => {
    setResult(null);
    setProfile(null);
  };

  if (result && profile) {
    return <ResultScreen result={result} profile={profile} onRestart={handleRestart} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(30, 20, 15, 1) 0%, rgba(15, 10, 8, 1) 100%)',
      }}
    >
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 glow-text" style={{ color: 'var(--pale-gold)' }}>
            診断テストモード
          </h1>
          <p className="text-lg opacity-80" style={{ color: 'var(--dim-light)' }}>
            ランダムな診断結果を生成します
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-2xl mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.5), rgba(122, 29, 46, 0.4))',
            border: '3px solid rgba(166, 124, 82, 0.6)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>
            クイックテスト
          </h2>

          <button
            onClick={runRandomDiagnosis}
            disabled={isAnimating}
            className="w-full py-4 px-6 rounded-xl font-bold text-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.4), rgba(166, 124, 82, 0.4))',
              border: '2px solid rgba(191, 167, 110, 0.8)',
              color: 'var(--pale-gold)',
              boxShadow: '0 0 30px rgba(191, 167, 110, 0.3)',
            }}
          >
            {isAnimating ? (
              <>
                <RefreshCw className="animate-spin" size={24} />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Play size={24} />
                <span>ランダム診断を実行</span>
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.5), rgba(122, 29, 46, 0.4))',
            border: '3px solid rgba(166, 124, 82, 0.6)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--pale-gold)' }}>
            特定タイプの診断
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MBTI_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => runSpecificTypeDiagnosis(type)}
                disabled={isAnimating}
                className="py-3 px-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.7), rgba(122, 29, 46, 0.6))',
                  border: '2px solid rgba(166, 124, 82, 0.6)',
                  color: 'var(--pale-light)',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className="text-lg">{type}</div>
                <div className="text-xs opacity-70 mt-1">{TYPE_NAMES[type]}</div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
