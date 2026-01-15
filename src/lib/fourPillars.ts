const TENKAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const CHISHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const ZOKAN_MAP: Record<string, string> = {
  "子": "癸",
  "丑": "己癸辛",
  "寅": "甲丙戊",
  "卯": "乙",
  "辰": "戊乙癸",
  "巳": "丙庚戊",
  "午": "丁己",
  "未": "己丁乙",
  "申": "庚壬戊",
  "酉": "辛",
  "戌": "戊辛丁",
  "亥": "壬甲"
};

export interface PillarElement {
  天干: string;
  地支: string;
  蔵干: string;
}

export interface FourPillarsChart {
  year: PillarElement;
  month: PillarElement;
  day: PillarElement;
  hour: PillarElement;
}

function getYearPillar(year: number): PillarElement {
  const baseYear = 1924;
  const offset = (year - baseYear) % 60;
  const tenkanIndex = offset % 10;
  const chishiIndex = offset % 12;

  const tenkan = TENKAN[tenkanIndex];
  const chishi = CHISHI[chishiIndex];
  const zokan = ZOKAN_MAP[chishi] || "";

  return { 天干: tenkan, 地支: chishi, 蔵干: zokan };
}

function getMonthPillar(year: number, month: number): PillarElement {
  const yearTenkanIndex = ((year - 1924) % 60) % 10;
  const monthBase = (yearTenkanIndex % 5) * 2;
  const tenkanIndex = (monthBase + month - 1) % 10;
  const chishiIndex = (month + 1) % 12;

  const tenkan = TENKAN[tenkanIndex];
  const chishi = CHISHI[chishiIndex];
  const zokan = ZOKAN_MAP[chishi] || "";

  return { 天干: tenkan, 地支: chishi, 蔵干: zokan };
}

function getDayPillar(date: Date): PillarElement {
  const baseDate = new Date(1924, 0, 1);
  const diffTime = date.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const offset = (diffDays + 10) % 60;
  const tenkanIndex = offset % 10;
  const chishiIndex = offset % 12;

  const tenkan = TENKAN[tenkanIndex];
  const chishi = CHISHI[chishiIndex];
  const zokan = ZOKAN_MAP[chishi] || "";

  return { 天干: tenkan, 地支: chishi, 蔵干: zokan };
}

function getHourPillar(day: PillarElement, hour: number): PillarElement {
  const dayTenkanIndex = TENKAN.indexOf(day.天干);
  const hourChishiIndex = Math.floor((hour + 1) / 2) % 12;
  const hourBase = (dayTenkanIndex % 5) * 2;
  const tenkanIndex = (hourBase + hourChishiIndex) % 10;

  const tenkan = TENKAN[tenkanIndex];
  const chishi = CHISHI[hourChishiIndex];
  const zokan = ZOKAN_MAP[chishi] || "";

  return { 天干: tenkan, 地支: chishi, 蔵干: zokan };
}

export function calculateFourPillars(birthdate: string, birthTime?: string): FourPillarsChart {
  const [year, month, day] = birthdate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(date);

  let hourPillar: PillarElement;
  if (birthTime) {
    const [hours] = birthTime.split(':').map(Number);
    hourPillar = getHourPillar(dayPillar, hours);
  } else {
    hourPillar = { 天干: "不明", 地支: "不明", 蔵干: "不明" };
  }

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar
  };
}
