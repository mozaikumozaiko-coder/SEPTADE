import { useState, useEffect } from 'react';
import { Answer } from '../types';
import { questions } from '../data/questions';
import { getProgressPercentage, getChapterInfo } from '../utils/diagnosis';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionScreenProps {
  onComplete: (answers: Answer[]) => void;
}

export function QuestionScreen({ onComplete }: QuestionScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [sliderValue, setSliderValue] = useState<number>(4);
  const [showChapterModal, setShowChapterModal] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = getProgressPercentage(currentIndex + 1, questions.length);
  const { chapter, isChapterComplete } = getChapterInfo(currentIndex + 1);

  useEffect(() => {
    const savedAnswer = answers.get(currentQuestion.id);
    if (savedAnswer) {
      setSliderValue(savedAnswer);
    } else {
      setSliderValue(4);
    }
  }, [currentIndex, currentQuestion.id, answers]);

  const handleAnswer = (value: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, value);
    setAnswers(newAnswers);
    setSliderValue(value);
  };

  const handleNext = () => {
    if (!answers.has(currentQuestion.id)) {
      handleAnswer(sliderValue);
    }

    if (currentIndex < questions.length - 1) {
      if (isChapterComplete) {
        setShowChapterModal(true);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    } else {
      const finalAnswers: Answer[] = Array.from(answers.entries()).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      if (finalAnswers.length < questions.length) {
        finalAnswers.push({
          questionId: currentQuestion.id,
          value: sliderValue,
        });
      }

      onComplete(finalAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleChapterModalClose = () => {
    setShowChapterModal(false);
    setCurrentIndex(currentIndex + 1);
  };

  const getSliderLabel = (value: number): string => {
    const labels = [
      '全く否なり',
      '否なり',
      'やや否なり',
      'いずれとも言えぬ',
      'やや然り',
      '然り',
      '強く然り',
    ];
    return labels[value - 1] || '';
  };

  return (
    <>
      <div className="question-screen-container">
        <div className="ornate-border max-w-4xl w-full rounded-lg p-4 sm:p-8 md:p-16 relative">
          <div className="relative z-10">
          <div className="mb-0.5 sm:mb-8" style={{ position: 'relative', zIndex: 10000 }}>
            <div className="flex items-center justify-between mb-0.5 sm:mb-4">
              <span className="text-xs sm:text-lg md:text-xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                第 {chapter} 章 ─ 問 {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-bold glow-text" style={{ color: 'var(--ochre)' }}>
                {progress}%
              </span>
            </div>

            <div className="progress-bar relative" style={{ overflow: 'hidden' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <img
              src="/マイビデオ.gif"
              alt="mascot"
              className="absolute transition-all duration-300 ease-out pointer-events-none w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
              style={{
                left: `${progress}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 15px rgba(166, 124, 82, 0.8))',
                zIndex: 99999
              }}
            />
          </div>

          <div className="mb-0.5 sm:mb-10">
            <div className="flex flex-col md:flex-row items-start gap-2 sm:gap-6 mb-4 sm:mb-8">
              <div className="w-full md:w-2/5 flex justify-center md:justify-start">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 miko-container" style={{
                  filter: 'drop-shadow(0 0 30px rgba(166, 124, 82, 0.5))',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  <img
                    src="/マイビデオ copy copy.gif"
                    alt="巫女"
                    className="w-full h-full object-contain miko-image"
                    style={{
                      imageRendering: 'crisp-edges'
                    }}
                  />
                </div>
              </div>

              <div className="w-full md:w-3/5 flex items-center">
                <div className="relative w-full">
                  <div className="hidden md:block absolute -left-4 top-0 w-0 h-0" style={{
                    borderTop: '15px solid transparent',
                    borderBottom: '15px solid transparent',
                    borderRight: '15px solid rgba(166, 124, 82, 0.3)'
                  }}></div>

                  <div className="rounded-lg p-2 sm:p-6 md:p-10 flex items-center question-bubble" style={{
                    background: 'linear-gradient(135deg, rgba(13, 13, 15, 0.65), rgba(26, 26, 28, 0.55))',
                    border: '2px solid rgba(166, 124, 82, 0.6)',
                    boxShadow: '0 0 30px rgba(166, 124, 82, 0.3), inset 0 2px 10px rgba(0, 0, 0, 0.5)',
                  }}>
                    <h3 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-bold glow-text" style={{
                      color: 'var(--pale-gold)',
                      lineHeight: '1.6',
                      letterSpacing: '0.05em'
                    }}>
                      {currentQuestion.text}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-0.5 sm:space-y-8">
              <div className="relative px-1 sm:px-2">
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="ancient-slider"
                />

                <div className="flex justify-between mt-0.5 sm:mt-4 text-xs sm:text-sm md:text-base lg:text-lg font-bold" style={{ color: 'var(--pale-gold)' }}>
                  <span className="glow-text">全く否なり</span>
                  <span className="glow-text">強く然り</span>
                </div>
              </div>

              <div className="text-center py-0.5 sm:py-6">
                <p className="text-xs sm:text-2xl md:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                  {getSliderLabel(sliderValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 sm:gap-4 pt-0.5 sm:pt-4 border-t border-white/10 mt-0 sm:mt-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="mystic-button flex items-center gap-0.5 sm:gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none px-2 sm:px-4 md:px-6 py-1.5 sm:py-3 text-xs sm:text-base"
            >
              <ChevronLeft size={14} className="sm:w-5 sm:h-5" />
              <span>前の問い</span>
            </button>

            <div className="text-center flex-shrink min-w-0">
              <p className="text-xs sm:text-base md:text-lg lg:text-xl font-bold glow-text whitespace-nowrap" style={{ color: 'var(--pale-gold)' }}>
                <span className="hidden xs:inline">回答済: </span>{answers.size}/{questions.length}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="mystic-button flex items-center gap-0.5 sm:gap-2 px-2 sm:px-4 md:px-6 py-1.5 sm:py-3 text-xs sm:text-base"
            >
              <span>
                {currentIndex === questions.length - 1 ? '魂の顕現' : '次の問い'}
              </span>
              <ChevronRight size={14} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          </div>
        </div>
      </div>

      {showChapterModal && (
        <div className="chapter-modal">
          <div className="ornate-border max-w-lg w-full rounded-lg p-6 sm:p-12 text-center mx-4 relative" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 glow-text" style={{ color: 'var(--pale-gold)', flexShrink: 0 }}>
              第 {chapter} 章 完
            </h3>

            <div className="mb-4 space-y-3" style={{ pointerEvents: 'none', overflowY: 'auto', flexGrow: 1, paddingRight: '8px' }}>
              {chapter === 1 && (
                <>
                  <p className="text-lg" style={{ color: 'var(--pale-light)' }}>
                    {chapter * 20}の問いに答え終えた
                  </p>

                  <p className="text-base opacity-80 leading-loose" style={{ color: 'var(--dim-light)' }}>
                    汝の魂の輪郭が、徐々に浮かび上がりつつある。<br />
                    <br />
                    されど、真実は未だ深き霧の中。
                  </p>
                </>
              )}

              {chapter === 2 && (
                <>
                  <p className="text-lg font-bold mb-4" style={{ color: 'var(--pale-light)' }}>
                    第二の問い、答え終えた。
                  </p>

                  <p className="text-base opacity-80 leading-loose" style={{ color: 'var(--dim-light)' }}>
                    汝の魂は、ただの輪郭ではない。<br />
                    光に照らされる部分と、影に潜む衝動がある。<br />
                    <br />
                    ここで見えたのは、<br />
                    汝が「何を求め」、そして「何を恐れる」か。<br />
                    <br />
                    されど、まだ足りぬ。<br />
                    人は願いだけで動かず、痛みでも動く。
                  </p>
                </>
              )}

              {chapter === 3 && (
                <>
                  <p className="text-lg font-bold mb-4" style={{ color: 'var(--pale-light)' }}>
                    第三の問い、答え終えた。
                  </p>

                  <p className="text-base opacity-80 leading-loose" style={{ color: 'var(--dim-light)' }}>
                    汝の内なる癖は、いま明らかになった。<br />
                    追い風のときに伸びるのか、<br />
                    逆風のときに燃えるのか。<br />
                    <br />
                    そして、崩れる瞬間の型――<br />
                    汝が弱るのは怠けではない。<br />
                    「守りたいもの」がある証なり。<br />
                    <br />
                    されど、真の試練は外にある。<br />
                    人と交わる時、魂は最も露わになる。
                  </p>
                </>
              )}

              {chapter === 4 && (
                <>
                  <p className="text-lg font-bold mb-4" style={{ color: 'var(--pale-light)' }}>
                    第四の問い、答え終えた。
                  </p>

                  <p className="text-base opacity-80 leading-loose" style={{ color: 'var(--dim-light)' }}>
                    汝の対人の構えが見えた。<br />
                    近づきて力となる者。<br />
                    離れこそ安寧となる者。<br />
                    言葉よりも先に、空気を読む者。<br />
                    刃のごとく、正しさを振るう者。<br />
                    <br />
                    縁は運命を運ぶ舟。<br />
                    だが舟を操るのは、汝の選択である。<br />
                    <br />
                    されど、縁の先にあるもの――<br />
                    「進路」を決めねば、舟は漂うのみ。
                  </p>
                </>
              )}

              {chapter === 5 && (
                <>
                  <p className="text-lg font-bold mb-4" style={{ color: 'var(--pale-light)' }}>
                    第五の問い、答え終えた。
                  </p>

                  <p className="text-base opacity-80 leading-loose" style={{ color: 'var(--dim-light)' }}>
                    ここにて、汝の魂は一つに結ばれた。<br />
                    輪郭、衝動、逆境の型、縁の構え、そして進路。<br />
                    散らばりし断片は、今や一本の道となる。<br />
                    <br />
                    されど、道は知るだけでは開かれぬ。<br />
                    歩むことで、運命は動く。<br />
                    <br />
                    最後に授けよう。<br />
                    汝の「勝ち筋」と「禁じ手」。<br />
                    そして、明日からの一手。<br />
                    <br />
                    汝はもう、霧の中の旅人ではない。<br />
                    ――ここより先、汝自身が灯火となれ。
                  </p>
                </>
              )}
            </div>

            <div style={{ flexShrink: 0, marginTop: '0px', paddingTop: '8px' }}>
              <button onClick={handleChapterModalClose} className="mystic-button text-sm sm:text-base" style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}>
                次章へ進む
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
