import { useState, useEffect } from 'react';
import { Clock, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getUserDiagnosisHistory } from '../lib/diagnosisHistory';
import { Profile, DiagnosisResult } from '../types';

interface HistoryItem {
  id: string;
  profile: Profile;
  result: DiagnosisResult;
  createdAt: string;
  sendUserId?: string;
  gptReport?: any;
  orderNumber?: string;
}

interface DiagnosisHistoryListProps {
  onSelectHistory: (profile: Profile, result: DiagnosisResult, sendUserId?: string, gptReport?: any) => void;
  refreshTrigger?: number;
}

export function DiagnosisHistoryList({ onSelectHistory, refreshTrigger }: DiagnosisHistoryListProps) {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getUserDiagnosisHistory(10);
    setHistory(data);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return null;
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 rounded-lg transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.5), rgba(122, 29, 46, 0.4))',
          border: '2px solid rgba(166, 124, 82, 0.6)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} style={{ color: 'var(--pale-gold)' }} />
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                過去の巡礼記録
              </h3>
              <p className="text-xs opacity-70" style={{ color: 'var(--dim-light)' }}>
                {history.length}件の記録
              </p>
            </div>
          </div>
          <ChevronDown
            size={24}
            style={{
              color: 'var(--ochre)',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 rounded-xl p-4 sm:p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 15, 10, 0.95), rgba(30, 20, 15, 0.92))',
                border: '2px solid rgba(166, 124, 82, 0.5)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(166, 124, 82, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="text-center mb-4">
                <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--dim-light)' }}>
                  汝が辿りし魂の軌跡
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(166, 124, 82, 0.5) rgba(0, 0, 0, 0.2)',
              }}>
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectHistory(item.profile, item.result, item.sendUserId, item.gptReport)}
                    className="w-full p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] text-left"
                    style={{
                      background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.7), rgba(122, 29, 46, 0.6))',
                      border: '2px solid rgba(166, 124, 82, 0.6)',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="text-lg sm:text-xl font-bold px-3 py-1 rounded"
                            style={{
                              background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.3), rgba(166, 124, 82, 0.2))',
                              border: '1px solid rgba(166, 124, 82, 0.5)',
                              color: 'var(--pale-gold)',
                            }}
                          >
                            {item.result.type}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium truncate" style={{ color: 'var(--pale-light)' }}>
                              {item.result.typeName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs opacity-70" style={{ color: 'var(--dim-light)' }}>
                          <Clock size={14} />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <ChevronRight size={20} style={{ color: 'var(--ochre)' }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 text-center">
        <button
          onClick={() => navigate('/all-types')}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-500 hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.4), rgba(166, 124, 82, 0.4))',
            border: '3px solid rgba(191, 167, 110, 0.8)',
            color: 'var(--pale-gold)',
            boxShadow: '0 0 40px rgba(191, 167, 110, 0.4), 0 0 60px rgba(191, 167, 110, 0.2)',
            textShadow: '0 0 15px rgba(191, 167, 110, 0.8)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 60px rgba(191, 167, 110, 0.6), 0 0 100px rgba(191, 167, 110, 0.3)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(191, 167, 110, 0.6), rgba(166, 124, 82, 0.6))';
            e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 40px rgba(191, 167, 110, 0.4), 0 0 60px rgba(191, 167, 110, 0.2)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(191, 167, 110, 0.4), rgba(166, 124, 82, 0.4))';
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
          }}
        >
          <BookOpen size={24} />
          <span>全17タイプ一覧</span>
        </button>
      </div>
    </div>
  );
}
