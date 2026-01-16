import { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { getUserDiagnosisHistory } from '../lib/diagnosisHistory';
import { Profile, DiagnosisResult } from '../types';

interface HistoryItem {
  id: string;
  profile: Profile;
  result: DiagnosisResult;
  createdAt: string;
}

interface DiagnosisHistoryListProps {
  onSelectHistory: (profile: Profile, result: DiagnosisResult) => void;
}

export function DiagnosisHistoryList({ onSelectHistory }: DiagnosisHistoryListProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getUserDiagnosisHistory(3);
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
    return (
      <div className="text-center py-8">
        <p className="text-sm opacity-70" style={{ color: 'var(--dim-light)' }}>
          過去の記録を読み込んでいます...
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div
        className="rounded-xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 15, 10, 0.95), rgba(30, 20, 15, 0.92))',
          border: '2px solid rgba(166, 124, 82, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(166, 124, 82, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 glow-text" style={{ color: 'var(--pale-gold)' }}>
            過去の巡礼記録
          </h3>
          <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--dim-light)' }}>
            汝が辿りし魂の軌跡
          </p>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item.profile, item.result)}
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
    </div>
  );
}
