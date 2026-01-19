import { typeDetails } from '../data/typeDetails';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AllTypesScreen() {
  const navigate = useNavigate();
  const allTypes = Object.values(typeDetails);

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
            全17タイプ一覧
          </h1>
          <p className="text-base sm:text-lg" style={{ color: 'var(--pale-light)' }}>
            それぞれのタイプの詳細を知ることができます
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allTypes.map((type) => (
            <div
              key={type.code}
              className="p-6 rounded-lg cursor-pointer transition-all duration-500 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(23, 8, 35, 0.9) 50%, rgba(0, 0, 0, 0.8) 100%)',
                border: '3px solid rgba(191, 167, 110, 0.7)',
                boxShadow: '0 0 40px rgba(191, 167, 110, 0.3), inset 0 0 60px rgba(191, 167, 110, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(191, 167, 110, 1)';
                e.currentTarget.style.boxShadow = '0 0 60px rgba(191, 167, 110, 0.6), 0 0 100px rgba(191, 167, 110, 0.3), inset 0 0 80px rgba(191, 167, 110, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(191, 167, 110, 0.7)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(191, 167, 110, 0.3), inset 0 0 60px rgba(191, 167, 110, 0.1)';
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
              }}
            >
              <div className="mb-4">
                <div className="flex items-start gap-4 mb-2">
                  <div className="flex-shrink-0">
                    <img
                      src={`/${type.code.toLowerCase()}.gif`}
                      alt={type.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover transition-all duration-300 hover:scale-110"
                      style={{
                        border: '3px solid rgba(191, 167, 110, 0.8)',
                        boxShadow: '0 0 30px rgba(191, 167, 110, 0.5), 0 0 50px rgba(191, 167, 110, 0.2)',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold" style={{
                      color: 'var(--pale-gold)',
                      textShadow: '0 0 20px rgba(191, 167, 110, 0.8), 0 0 40px rgba(191, 167, 110, 0.4)'
                    }}>
                      {type.code}
                    </h2>
                    <span className="text-xl sm:text-2xl font-bold block" style={{
                      color: 'var(--pale-light)',
                      textShadow: '0 0 15px rgba(191, 167, 110, 0.5)'
                    }}>
                      {type.name}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: 'var(--pale-gold)', opacity: 0.9 }}>
                  {type.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: 'var(--pale-light)' }}>
                  {type.description}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold mb-2" style={{
                    color: 'var(--pale-gold)',
                    textShadow: '0 0 10px rgba(191, 167, 110, 0.6)'
                  }}>
                    特徴
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {type.characteristics.map((char, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs sm:text-sm rounded-full transition-all duration-300 hover:scale-110"
                        style={{
                          background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.3), rgba(166, 124, 82, 0.3))',
                          border: '2px solid rgba(191, 167, 110, 0.7)',
                          color: 'var(--pale-gold)',
                          boxShadow: '0 0 15px rgba(191, 167, 110, 0.3)',
                          textShadow: '0 0 10px rgba(191, 167, 110, 0.5)',
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-2" style={{
                    color: 'var(--pale-gold)',
                    textShadow: '0 0 10px rgba(191, 167, 110, 0.6)'
                  }}>
                    強み
                  </h4>
                  <ul className="space-y-1">
                    {type.strengths.map((strength, idx) => (
                      <li key={idx} className="text-xs sm:text-sm" style={{ color: 'var(--pale-light)' }}>
                        ・{strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-2" style={{
                    color: 'var(--pale-gold)',
                    textShadow: '0 0 10px rgba(191, 167, 110, 0.6)'
                  }}>
                    弱み
                  </h4>
                  <ul className="space-y-1">
                    {type.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-xs sm:text-sm" style={{ color: 'var(--pale-light)' }}>
                        ・{weakness}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-2" style={{
                    color: 'var(--pale-gold)',
                    textShadow: '0 0 10px rgba(191, 167, 110, 0.6)'
                  }}>
                    アドバイス
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--pale-light)' }}>
                    {type.advice}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-2" style={{
                    color: 'var(--pale-gold)',
                    textShadow: '0 0 10px rgba(191, 167, 110, 0.6)'
                  }}>
                    詳細な強み
                  </h4>
                  <ul className="space-y-1">
                    {type.detailedStrengths.map((strength, idx) => (
                      <li key={idx} className="text-xs sm:text-sm" style={{ color: 'var(--pale-light)' }}>
                        ・{strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-2" style={{
                    color: 'var(--pale-gold)',
                    textShadow: '0 0 10px rgba(191, 167, 110, 0.6)'
                  }}>
                    適職トップ10
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {type.topCareers.map((career, idx) => (
                      <li key={idx} className="text-xs sm:text-sm" style={{ color: 'var(--pale-light)' }}>
                        {idx + 1}. {career}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-2" style={{
                    color: 'var(--pale-gold)',
                    textShadow: '0 0 10px rgba(191, 167, 110, 0.6)'
                  }}>
                    詳細な弱み
                  </h4>
                  <ul className="space-y-1">
                    {type.detailedWeaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-xs sm:text-sm" style={{ color: 'var(--pale-light)' }}>
                        ・{weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/tarot-cards')}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg rounded-lg font-bold transition-all duration-500 hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, rgba(191, 167, 110, 0.3), rgba(166, 124, 82, 0.3))',
              border: '3px solid rgba(191, 167, 110, 0.8)',
              color: 'var(--pale-gold)',
              boxShadow: '0 0 40px rgba(191, 167, 110, 0.4), 0 0 60px rgba(191, 167, 110, 0.2)',
              textShadow: '0 0 15px rgba(191, 167, 110, 0.8)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 60px rgba(191, 167, 110, 0.6), 0 0 100px rgba(191, 167, 110, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(191, 167, 110, 0.5), rgba(166, 124, 82, 0.5))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(191, 167, 110, 0.4), 0 0 60px rgba(191, 167, 110, 0.2)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(191, 167, 110, 0.3), rgba(166, 124, 82, 0.3))';
            }}
          >
            <BookOpen size={24} />
            <span>すべてのタロットを見る</span>
          </button>
        </div>
      </div>
    </div>
  );
}
