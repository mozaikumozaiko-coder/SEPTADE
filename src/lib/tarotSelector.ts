import { Scores } from '../types';

const MAJOR_ARCANA = [
  { id: 0, name: "愚者", meaning: "新たな冒険、自由、無邪気さ" },
  { id: 1, name: "魔術師", meaning: "創造力、行動力、スキル" },
  { id: 2, name: "女教皇", meaning: "直感、知恵、内省" },
  { id: 3, name: "女帝", meaning: "豊かさ、育成、創造性" },
  { id: 4, name: "皇帝", meaning: "権威、構造、リーダーシップ" },
  { id: 5, name: "教皇", meaning: "伝統、指導、信念" },
  { id: 6, name: "恋人", meaning: "選択、調和、関係性" },
  { id: 7, name: "戦車", meaning: "意志、決断、前進" },
  { id: 8, name: "力", meaning: "勇気、忍耐、内なる強さ" },
  { id: 9, name: "隠者", meaning: "内省、探求、孤独" },
  { id: 10, name: "運命の輪", meaning: "変化、サイクル、運命" },
  { id: 11, name: "正義", meaning: "公平、真実、バランス" },
  { id: 12, name: "吊られた男", meaning: "視点の転換、犠牲、待機" },
  { id: 13, name: "死神", meaning: "変容、終わりと始まり、再生" },
  { id: 14, name: "節制", meaning: "バランス、調和、統合" },
  { id: 15, name: "悪魔", meaning: "執着、誘惑、束縛" },
  { id: 16, name: "塔", meaning: "突然の変化、破壊、啓示" },
  { id: 17, name: "星", meaning: "希望、インスピレーション、癒し" },
  { id: 18, name: "月", meaning: "不安、幻想、直感" },
  { id: 19, name: "太陽", meaning: "成功、喜び、明瞭さ" },
  { id: 20, name: "審判", meaning: "覚醒、再生、呼びかけ" },
  { id: 21, name: "世界", meaning: "達成、完成、統合" }
];

export interface TarotCard {
  id: number;
  name: string;
  meaning: string;
}

export function selectTarotCard(type: string, scores: Scores): TarotCard {
  const firstChar = type[0];
  const secondChar = type[1];
  const thirdChar = type[2];
  const fourthChar = type[3];

  if (firstChar === 'E' && scores.E > 30) {
    if (thirdChar === 'T') return MAJOR_ARCANA[4];
    if (fourthChar === 'J') return MAJOR_ARCANA[7];
    return MAJOR_ARCANA[19];
  }

  if (firstChar === 'I' && scores.E < -30) {
    if (secondChar === 'N') return MAJOR_ARCANA[9];
    if (thirdChar === 'F') return MAJOR_ARCANA[2];
    return MAJOR_ARCANA[17];
  }

  if (secondChar === 'N' && scores.S < -30) {
    if (thirdChar === 'F') return MAJOR_ARCANA[3];
    return MAJOR_ARCANA[1];
  }

  if (secondChar === 'S' && scores.S > 30) {
    if (fourthChar === 'J') return MAJOR_ARCANA[11];
    return MAJOR_ARCANA[14];
  }

  if (thirdChar === 'T' && scores.T > 30) {
    return MAJOR_ARCANA[1];
  }

  if (thirdChar === 'F' && scores.T < -30) {
    return MAJOR_ARCANA[6];
  }

  if (fourthChar === 'P' && scores.J < -30) {
    return MAJOR_ARCANA[0];
  }

  const avgScore = (Math.abs(scores.E) + Math.abs(scores.S) + Math.abs(scores.T) + Math.abs(scores.J)) / 4;
  if (avgScore < 15) {
    return MAJOR_ARCANA[14];
  }

  return MAJOR_ARCANA[10];
}
