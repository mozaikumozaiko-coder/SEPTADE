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
  topCareers: string[];
}

export interface ChartItem {
  title: string;
  value: number;
  desc: string;
}

export interface Item {
  title: string;
  desc: string;
}

export interface GPTReport {
  tarotExplanation: string;
  astrology: string;
  section1: {
    content: string;
  };
  section2: {
    content: string;
    charts: ChartItem[];
    items: Item[];
  };
  section3: {
    content: string;
    charts: ChartItem[];
    items: Item[];
  };
  fourPillars: {
    chart: {
      year: { 天干: string; 地支: string; 蔵干: string };
      month: { 天干: string; 地支: string; 蔵干: string };
      day: { 天干: string; 地支: string; 蔵干: string };
      hour: { 天干: string; 地支: string; 蔵干: string };
    };
    basic: string;
    charts: ChartItem[];
    itemsA: Item[];
    itemsB: Item[];
    itemsC: Item[];
  };
  section4: {
    content: string;
    charts: ChartItem[];
    items: Item[];
  };
}
