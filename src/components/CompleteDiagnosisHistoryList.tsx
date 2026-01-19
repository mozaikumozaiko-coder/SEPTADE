import { useState, useEffect, useCallback } from 'react';
import { Sparkles, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getUserCompleteDiagnosisHistory } from '../lib/diagnosisHistory';
import { Profile, DiagnosisResult } from '../types';

interface HistoryItem {
  id: string;
  profile: Profile;
  result: DiagnosisResult;
  createdAt: string;
  updatedAt?: string;
  sendUserId?: string;
  gptReport: any;
  orderNumber?: string;
}

interface CompleteDiagnosisHistoryListProps {
  onSelectHistory: (profile: Profile, result: DiagnosisResult, sendUserId?: string, gptReport?: any) => void;
  refreshTrigger?: number;
}

export function CompleteDiagnosisHistoryList({ onSelectHistory, refreshTrigger }: CompleteDiagnosisHistoryListProps) {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    console.log('🔄 Loading complete diagnosis history... (refreshTrigger:', refreshTrigger, ')');
    const data = await getUserCompleteDiagnosisHistory();
    console.log('✅ Complete diagnosis history loaded:', data.length, 'items (all with GPT reports)');
    setHistory(data);
    setLoading(false);
  }, [refreshTrigger]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 rounded-lg transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.6), rgba(166, 124, 82, 0.5))',
          border: '2px solid rgba(191, 167, 110, 0.8)',
          boxShadow: '0 4px 10px rgba(191, 167, 110, 0.3), 0 0 20px rgba(191, 167, 110, 0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={20} style={{ color: 'var(--pale-gold)' }} />
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                完全版の巡礼記録
              </h3>
              <p className="text-xs opacity-70" style={{ color: 'var(--dim-light)' }}>
                {history.length}件の完全版記録
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
                border: '2px solid rgba(191, 167, 110, 0.6)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(191, 167, 110, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="text-center mb-4">
                <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--dim-light)' }}>
                  深淵まで辿りし魂の完全なる軌跡
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(191, 167, 110, 0.5) rgba(0, 0, 0, 0.2)',
              }}>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-sm opacity-70" style={{ color: 'var(--dim-light)' }}>
                      読み込み中...
                    </p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm opacity-70" style={{ color: 'var(--dim-light)' }}>
                      まだ完全版の記録がありません
                    </p>
                    <p className="text-xs opacity-50 mt-2" style={{ color: 'var(--dim-light)' }}>
                      購入した完全版の鑑定結果がここに表示されます
                    </p>
                  </div>
                ) : (
                  history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectHistory(item.profile, item.result, item.sendUserId, item.gptReport)}
                    className="w-full p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] text-left relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.8), rgba(166, 124, 82, 0.7))',
                      border: '2px solid rgba(191, 167, 110, 0.8)',
                      boxShadow: '0 4px 10px rgba(191, 167, 110, 0.4), 0 0 20px rgba(191, 167, 110, 0.2)',
                    }}
                  >
                    <div
                      className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.9), rgba(166, 124, 82, 0.8))',
                        color: 'var(--pale-gold)',
                        boxShadow: '0 0 10px rgba(191, 167, 110, 0.6)',
                      }}
                    >
                      <Sparkles size={12} />
                      <span>完全版</span>
                    </div>

                    <div className="pr-20">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm sm:text-base" style={{ color: 'var(--pale-gold)' }}>
                            {item.profile.name}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm" style={{ color: 'var(--dim-light)' }}>
                          <span>{new Date(item.profile.birthdate).toLocaleDateString('ja-JP')}</span>
                          {item.profile.birthtime && (
                            <span>{item.profile.birthtime}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.result.card.image}
                            alt={item.result.card.name}
                            className="w-8 h-12 sm:w-10 sm:h-14 object-cover rounded shadow-lg"
                            style={{ border: '2px solid rgba(166, 124, 82, 0.8)' }}
                          />
                          <div>
                            <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--ochre)' }}>
                              {item.result.card.name}
                            </p>
                            <p className="text-xs opacity-70" style={{ color: 'var(--dim-light)' }}>
                              {item.result.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs opacity-70" style={{ color: 'var(--dim-light)' }}>
                            {formatDate(item.createdAt)}
                          </span>
                          {item.updatedAt && item.updatedAt !== item.createdAt && (
                            <span className="text-xs opacity-50" style={{ color: 'var(--dim-light)' }}>
                              更新: {formatDate(item.updatedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
