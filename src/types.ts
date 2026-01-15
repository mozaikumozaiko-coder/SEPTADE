export interface Question {
  id: number;
  text: string;
  category: 'E' | 'S' | 'T' | 'J';
  reverse?: boolean;
}

export interface Profile {
  name: string;
  birthdate: string;
  gender: '男性' | '女性' | 'その他';
  concern: string;
}

export interface Answer {
  questionId: number;
  value: number;
}

export interface Scores {
  E: number;
  S: number;
  T: number;
  J: number;
}

export interface DiagnosisResult {
  type: string;
  typeName: string;
  description: string;
  scores: Scores;
  characteristics: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface TypeDetail {
  code: string;
  name: string;
  title: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  weaknesses: string[];
  advice: string;
}
