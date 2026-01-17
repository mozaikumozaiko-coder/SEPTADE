import { Answer, Scores, DiagnosisResult } from '../types';
import { questions } from '../data/questions';
import { typeDetails } from '../data/typeDetails';
import { scoreFortune } from '../lib/scoreFortune';
import { selectTarotCard } from '../lib/tarotSelector';

function generateTags(): string[] {
  return questions.map((q) => {
    const sign = q.reverse ? '-' : '+';
    return `${q.category}${sign}`;
  });
}

export function calculateScores(answers: Answer[]): Scores {
  try {
    const answerValues = answers
      .sort((a, b) => a.questionId - b.questionId)
      .map((a) => a.value);

    const tags = generateTags();

    const result = scoreFortune({
      answers: answerValues,
      tags: tags,
    });

    return {
      E: result.scores.E,
      S: result.scores.S,
      T: result.scores.T,
      J: result.scores.J,
    };
  } catch (error) {
    console.error('Error calculating scores:', error);

    const scores: Scores = { E: 0, S: 0, T: 0, J: 0 };
    answers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return;
      const normalizedValue = question.reverse ? 8 - answer.value : answer.value;
      scores[question.category] += normalizedValue;
    });
    return scores;
  }
}

export function determineType(scores: Scores): string {
  const type1 = scores.E >= 0 ? 'E' : 'I';
  const type2 = scores.S >= 0 ? 'S' : 'N';
  const type3 = scores.T >= 0 ? 'T' : 'F';
  const type4 = scores.J >= 0 ? 'J' : 'P';

  const baseType = `${type1}${type2}${type3}${type4}`;

  if (baseType === 'ENTJ' && scores.E >= 30 && scores.T >= 30 && scores.J >= 30) {
    return 'ENTJ-A';
  }

  return baseType;
}

export function getDiagnosisResult(answers: Answer[]): DiagnosisResult {
  const scores = calculateScores(answers);
  const type = determineType(scores);
  const details = typeDetails[type] || typeDetails['INFP'];
  const tarotCard = selectTarotCard(type, scores);

  return {
    type: details.code,
    typeName: details.name,
    description: details.description,
    scores,
    characteristics: details.characteristics,
    strengths: details.strengths,
    weaknesses: details.weaknesses,
    tarotCard,
  };
}

export function getProgressPercentage(currentQuestion: number, totalQuestions: number = 100): number {
  return Math.round((currentQuestion / totalQuestions) * 100);
}

export function getChapterInfo(questionNumber: number): { chapter: number; isChapterComplete: boolean } {
  const chapter = Math.ceil(questionNumber / 20);
  const isChapterComplete = questionNumber % 20 === 0 && questionNumber > 0;

  return { chapter, isChapterComplete };
}
