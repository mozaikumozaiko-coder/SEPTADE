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
          <div className="mb-6 sm:mb-8" style={{ position: 'relative', zIndex: 10000 }}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-base sm:text-lg md:text-xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                第 {chapter} 章 ─ 問 {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-base sm:text-lg md:text-xl font-bold glow-text" style={{ color: 'var(--ochre)' }}>
                {progress}%
              </span>
            </div>

            <div className="progress-bar relative" style={{ overflow: 'hidden' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <img
              src="/マイビデオ.gif"
              alt="mascot"
              className="absolute transition-all duration-300 ease-out pointer-events-none w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36"
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

          <div className="mb-6 sm:mb-10">
            <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="w-full md:w-2/5 flex justify-center md:justify-start">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 miko-container" style={{
                  filter: 'drop-shadow(0 0 20px rgba(166, 124, 82, 0.3))'
                }}>
                  <img
                    src="/巫女s.gif"
                    alt="巫女"
                    className="w-full h-full object-contain miko-image"
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

                  <div className="rounded-lg p-4 sm:p-6 md:p-10 flex items-center question-bubble" style={{
                    background: 'linear-gradient(135deg, rgba(13, 13, 15, 0.65), rgba(26, 26, 28, 0.55))',
                    border: '2px solid rgba(166, 124, 82, 0.6)',
                    boxShadow: '0 0 30px rgba(166, 124, 82, 0.3), inset 0 2px 10px rgba(0, 0, 0, 0.5)',
                  }}>
                    <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold glow-text" style={{
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

            <div className="space-y-6 sm:space-y-8">
              <div className="relative px-2 sm:px-2">
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="ancient-slider"
                />

                <div className="flex justify-between mt-3 sm:mt-4 text-sm sm:text-sm md:text-base lg:text-lg font-bold" style={{ color: 'var(--pale-gold)' }}>
                  <span className="glow-text">全く否なり</span>
                  <span className="glow-text">強く然り</span>
                </div>
              </div>

              <div className="text-center py-4 sm:py-6">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold glow-text" style={{ color: 'var(--pale-gold)' }}>
                  {getSliderLabel(sliderValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-4 border-t border-white/10 mt-4 sm:mt-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="mystic-button flex items-center gap-2 sm:gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none px-4 sm:px-4 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
              <span>前の問い</span>
            </button>

            <div className="text-center flex-shrink min-w-0">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold glow-text whitespace-nowrap" style={{ color: 'var(--pale-gold)' }}>
                <span className="hidden sm:inline">回答済: </span>{answers.size}/{questions.length}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="mystic-button flex items-center gap-2 sm:gap-2 px-4 sm:px-4 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              <span>
                {currentIndex === questions.length - 1 ? '魂の顕現' : '次の問い'}
              </span>
              <ChevronRight size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          </div>
        </div>
      </div>

      {showChapterModal && (
        <div className="chapter-modal">
          <div className="ornate-border max-w-lg w-full rounded-lg p-12 text-center mx-4 relative">
            <div className="relative z-10">
            <div className="ancient-frame w-28 h-28 mx-auto mb-8 rounded"></div>

            <h3 className="text-3xl font-bold mb-4 glow-text" style={{ color: 'var(--pale-gold)' }}>
              第 {chapter} 章 完
            </h3>

            <div className="mb-8 space-y-3">
              <p className="text-lg" style={{ color: 'var(--pale-light)' }}>
                {chapter * 20}の問いに答え終えた
              </p>

              <p className="text-base opacity-80 leading-loose" style={{ color: 'var(--dim-light)' }}>
                汝の魂の輪郭が、徐々に浮かび上がりつつある。<br />
                <br />
                されど、真実は未だ深き霧の中。<br />
                次なる章へと歩を進めよ。
              </p>
            </div>

            <button onClick={handleChapterModalClose} className="mystic-button">
              次章へ進む
            </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
