export interface CompatibilityData {
  goodMatches: string[];
  badMatches: string[];
}

export const compatibility: Record<string, CompatibilityData> = {
  'ESTJ': {
    goodMatches: ['ISFP', 'ISTP', 'ESFJ', 'ISTJ', 'ENTJ'],
    badMatches: ['INFP', 'ENFP', 'INTP', 'ENTP', 'INFJ']
  },
  'ENTJ': {
    goodMatches: ['INTP', 'INTJ', 'ENTP', 'ESTJ', 'ENTJ-A'],
    badMatches: ['ISFP', 'ESFP', 'ISFJ', 'ESFJ', 'INFP']
  },
  'ESFJ': {
    goodMatches: ['ISFP', 'ISTP', 'ESTJ', 'ESFP', 'ISFJ'],
    badMatches: ['INTP', 'INTJ', 'ENTP', 'ENTJ', 'INFJ']
  },
  'ENFJ': {
    goodMatches: ['INFP', 'INFJ', 'ENFP', 'ISFP', 'INTP'],
    badMatches: ['ESTP', 'ISTP', 'ESTJ', 'ISTJ', 'ESFP']
  },
  'ISTJ': {
    goodMatches: ['ESFP', 'ESTP', 'ESTJ', 'ISFJ', 'ESFJ'],
    badMatches: ['ENFP', 'ENTP', 'INFP', 'INTP', 'ENFJ']
  },
  'INTJ': {
    goodMatches: ['ENFP', 'ENTP', 'ENTJ', 'INFJ', 'INTP'],
    badMatches: ['ESFJ', 'ISFJ', 'ESFP', 'ISFP', 'ESTJ']
  },
  'ISFJ': {
    goodMatches: ['ESFP', 'ESTP', 'ISTJ', 'ESFJ', 'ISFP'],
    badMatches: ['ENTP', 'ENTJ', 'INTP', 'INTJ', 'ENFP']
  },
  'INFJ': {
    goodMatches: ['ENFP', 'ENTP', 'INFP', 'INTJ', 'ENFJ'],
    badMatches: ['ESTP', 'ESFP', 'ESTJ', 'ISTP', 'ESFJ']
  },
  'ESTP': {
    goodMatches: ['ISFJ', 'ISTJ', 'ESFP', 'ISTP', 'ESTP'],
    badMatches: ['INFJ', 'INFP', 'ENFJ', 'INTJ', 'ENFP']
  },
  'ENTP': {
    goodMatches: ['INFJ', 'INTJ', 'INTP', 'ENTJ', 'ENFP'],
    badMatches: ['ISFJ', 'ESFJ', 'ISTJ', 'ESTJ', 'ISFP']
  },
  'ESFP': {
    goodMatches: ['ISFJ', 'ISTJ', 'ESFJ', 'ESTP', 'ISFP'],
    badMatches: ['INTJ', 'ENTJ', 'INTP', 'INFJ', 'ENTP']
  },
  'ENFP': {
    goodMatches: ['INFJ', 'INTJ', 'ENFJ', 'INFP', 'ENTP'],
    badMatches: ['ISTJ', 'ESTJ', 'ISTP', 'ESTP', 'ISFJ']
  },
  'ISTP': {
    goodMatches: ['ESFJ', 'ESTJ', 'ESTP', 'ISFP', 'ISTJ'],
    badMatches: ['ENFJ', 'ENFP', 'INFJ', 'INFP', 'ENTJ']
  },
  'INTP': {
    goodMatches: ['ENTJ', 'ENTP', 'INTJ', 'INFJ', 'ENFP'],
    badMatches: ['ESFJ', 'ISFJ', 'ESFP', 'ESTJ', 'ISFP']
  },
  'ISFP': {
    goodMatches: ['ESTJ', 'ESFJ', 'ENFJ', 'ESFP', 'ISTP'],
    badMatches: ['ENTJ', 'INTJ', 'ENTP', 'INTP', 'ESTJ']
  },
  'INFP': {
    goodMatches: ['ENFJ', 'INFJ', 'ENFP', 'ENTJ', 'INTJ'],
    badMatches: ['ESTJ', 'ISTJ', 'ESTP', 'ISTP', 'ESFJ']
  },
  'ENTJ-A': {
    goodMatches: ['INTP', 'INTJ', 'ENTP', 'ENTJ', 'INFJ'],
    badMatches: ['ISFP', 'ESFP', 'ISFJ', 'ESFJ', 'INFP']
  }
};
