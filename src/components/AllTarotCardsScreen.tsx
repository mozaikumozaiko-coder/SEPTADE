import { MAJOR_ARCANA } from '../lib/tarotSelector';
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AllTarotCardsScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at center, rgba(23, 8, 35, 1) 0%, rgba(7, 2, 15, 1) 100%)',
    }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-20 animate-pulse" style={{
          background: 'radial-gradient(circle, rgba(191, 167, 110, 0.3), transparent)',
          filter: 'blur(40px)',
        }}></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full opacity-20 animate-pulse" style={{
          background: 'radial-gradient(circle, rgba(166, 124, 82, 0.3), transparent)',
          filter: 'blur(50px)',
          animationDelay: '1s',
        }}></div>
      </div>

      <div className="relative z-10 px-4 py-8 sm:py-12 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(191, 167, 110, 0.5)',
            color: 'var(--pale-gold)',
          }}
        >
          <ArrowLeft size={20} />
          <span>戻る</span>
        </button>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 glow-text" style={{
            color: 'var(--pale-gold)',
            textShadow: '0 0 30px rgba(191, 167, 110, 0.8)',
          }}>
            和風大アルカナ
          </h1>
          <p className="text-base sm:text-lg" style={{ color: 'var(--pale-light)' }}>
            22枚の神秘的なタロットカードの物語
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MAJOR_ARCANA.map((card) => (
            <div
              key={card.id}
              className="p-6 rounded-lg transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '2px solid rgba(191, 167, 110, 0.5)',
                boxShadow: '0 0 30px rgba(191, 167, 110, 0.2)',
              }}
            >
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <img
                    src={`/${card.id}_-_${card.name}(${card.originalName}).png`}
                    alt={card.name}
                    className="w-full h-64 object-contain rounded-lg"
                    style={{
                      filter: 'drop-shadow(0 0 15px rgba(191, 167, 110, 0.4))',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black/70 px-3 py-1 rounded-full text-sm font-bold" style={{ color: 'var(--pale-gold)' }}>
                    {card.id}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--pale-gold)' }}>
                    {card.name}
                  </h2>
                  <p className="text-sm mb-1" style={{ color: 'var(--pale-light)', opacity: 0.8 }}>
                    {card.reading}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--pale-gold)', opacity: 0.7 }}>
                    元名: {card.originalName}
                  </p>
                </div>

                <div className="pt-3 border-t" style={{ borderColor: 'rgba(191, 167, 110, 0.3)' }}>
                  <div className="mb-3">
                    <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--pale-gold)' }}>
                      キーワード
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {card.keywords.split('・').map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs rounded-full"
                          style={{
                            background: 'rgba(191, 167, 110, 0.2)',
                            border: '1px solid rgba(191, 167, 110, 0.5)',
                            color: 'var(--pale-gold)',
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--pale-gold)' }}>
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: 'rgba(191, 167, 110, 0.6)' }}></span>
                      正位置
                    </h4>
                    <p className="text-sm leading-relaxed pl-5" style={{ color: 'var(--pale-light)' }}>
                      {card.upright}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--pale-gold)' }}>
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: 'rgba(122, 29, 46, 0.6)' }}></span>
                      逆位置
                    </h4>
                    <p className="text-sm leading-relaxed pl-5" style={{ color: 'var(--pale-light)' }}>
                      {card.reversed}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/all-types')}
            className="mystic-button inline-flex items-center justify-center gap-3 px-8 py-4 text-lg"
          >
            <Users size={24} />
            <span>全17タイプを見る</span>
          </button>
        </div>
      </div>
    </div>
  );
}
