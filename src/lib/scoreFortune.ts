type Input = {
  answers: unknown;
  tags?: unknown;
};

function normalizeAnswers(v: unknown): number[] | null {
  if (typeof v === "string") {
    try { return normalizeAnswers(JSON.parse(v)); } catch { /* noop */ }
  }
  if (Array.isArray(v)) return v.map(n => Number(n));

  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;
    const keys = Object.keys(obj)
      .filter(k => /^\d+$/.test(k))
      .sort((a,b) => Number(a) - Number(b));
    if (keys.length) return keys.map(k => Number(obj[k]));
  }
  return null;
}

function toPoints(a: unknown): number {
  return Number(a) - 4;
}

function axisAdd(tag: string, pts: number): readonly [string, number] {
  const axis = tag[0];
  const sign = tag[1];
  const add = (sign === "+") ? pts : -pts;
  return [axis, add] as const;
}

function pctPos(score: number): number {
  return ((score + 100) / 200) * 100;
}

export interface FortuneResult {
  typeCode: string;
  isBAL: boolean;
  scores: {
    E: number;
    S: number;
    T: number;
    J: number;
  };
  percents: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  confidence: {
    axisEI: number;
    axisSN: number;
    axisTF: number;
    axisJP: number;
    overall: number;
  };
}

export function scoreFortune(input: Input): FortuneResult {
  const answers = normalizeAnswers(input.answers);

  if (!answers || answers.length !== 100) {
    throw new Error("answers must be an array of 100 integers (got " + (answers ? answers.length : "null") + ")");
  }

  let tags = input.tags as any;
  if (!tags) {
    tags = Array.from({length:100}, () => "E+");
  }
  if (typeof tags === "string") {
    try { tags = JSON.parse(tags); } catch { /* noop */ }
  }
  if (!Array.isArray(tags) || tags.length !== 100) {
    throw new Error("tags must be an array of 100 strings like E+/E-/S+/S-/T+/T-/J+/J-");
  }

  let scoreE=0, scoreS=0, scoreT=0, scoreJ=0;
  for (let i=0;i<100;i++){
    const pts = toPoints(answers[i]);
    const [ax, add] = axisAdd(String(tags[i]), pts);
    if (ax==="E") scoreE += add;
    else if (ax==="S") scoreS += add;
    else if (ax==="T") scoreT += add;
    else if (ax==="J") scoreJ += add;
    else throw new Error("invalid tag axis: " + tags[i]);
  }

  const isBAL =
    Math.abs(scoreE) < 10 &&
    Math.abs(scoreS) < 10 &&
    Math.abs(scoreT) < 10 &&
    Math.abs(scoreJ) < 10;

  let typeCode = "BAL";
  if (!isBAL) {
    const EorI = (scoreE >= 0) ? "E" : "I";
    const SorN = (scoreS >= 0) ? "S" : "N";
    const TorF = (scoreT >= 0) ? "T" : "F";
    const JorP = (scoreJ >= 0) ? "J" : "P";
    typeCode = `${EorI}${SorN}${TorF}${JorP}`;
  }

  const pE=pctPos(scoreE), pI=100-pE;
  const pS=pctPos(scoreS), pN=100-pS;
  const pT=pctPos(scoreT), pF=100-pT;
  const pJ=pctPos(scoreJ), pP=100-pJ;

  const axisEI = (Math.abs(scoreE)/100)*100;
  const axisSN = (Math.abs(scoreS)/100)*100;
  const axisTF = (Math.abs(scoreT)/100)*100;
  const axisJP = (Math.abs(scoreJ)/100)*100;
  const overall = (axisEI+axisSN+axisTF+axisJP)/4;

  return {
    typeCode,
    isBAL,
    scores: {E:scoreE, S:scoreS, T:scoreT, J:scoreJ},
    percents: {E:pE, I:pI, S:pS, N:pN, T:pT, F:pF, J:pJ, P:pP},
    confidence: {axisEI, axisSN, axisTF, axisJP, overall}
  };
}
