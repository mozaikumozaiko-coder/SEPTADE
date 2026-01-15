import { Answer, Scores, DiagnosisResult } from '../types';
import { questions } from '../data/questions';
import { typeDetails } from '../data/typeDetails';

export function calculateScores(answers: Answer[]): Scores {
  const scores: Scores = { E: 0, S: 0, T: 0, J: 0 };

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    const normalizedValue = question.reverse ? 8 - answer.value : answer.value;

    scores[question.category] += normalizedValue;
  });

  return scores;
}

export function determineType(scores: Scores): string {
  const eCount = questions.filter((q) => q.category === 'E').length;
  const sCount = questions.filter((q) => q.category === 'S').length;
  const tCount = questions.filter((q) => q.category === 'T').length;
  const jCount = questions.filter((q) => q.category === 'J').length;

  const eAvg = scores.E / eCount;
  const sAvg = scores.S / sCount;
  const tAvg = scores.T / tCount;
  const jAvg = scores.J / jCount;

  const type1 = eAvg >= 4 ? 'E' : 'I';
  const type2 = sAvg >= 4 ? 'S' : 'N';
  const type3 = tAvg >= 4 ? 'T' : 'F';
  const type4 = jAvg >= 4 ? 'J' : 'P';

  let baseType = `${type1}${type2}${type3}${type4}`;

  if (baseType === 'ENTJ' && eAvg >= 5.5 && tAvg >= 5.5 && jAvg >= 5.5) {
    return 'ENTJ-A';
  }

  return baseType;
}

export function getDiagnosisResult(answers: Answer[]): DiagnosisResult {
  const scores = calculateScores(answers);
  const type = determineType(scores);
  const details = typeDetails[type] || typeDetails['INFP'];

  return {
    type: details.code,
    typeName: details.name,
    description: details.description,
    scores,
    characteristics: details.characteristics,
    strengths: details.strengths,
    weaknesses: details.weaknesses,
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
