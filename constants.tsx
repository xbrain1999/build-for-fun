import type { MealFilter, RangeFilter, StageFilter } from "./types";

export const STAGE_OPTIONS: { value: StageFilter; label: string }[] = [
  { value: "primary", label: "小学" },
  { value: "all", label: "全部学段" },
  { value: "middle", label: "中学" },
  { value: "kindergarten", label: "县级幼儿园" },
];

export const MEAL_OPTIONS: { value: MealFilter; label: string }[] = [
  { value: "self", label: "自费餐" },
  { value: "all", label: "全部餐别" },
  { value: "nutrition", label: "营养餐" },
];

export const RANGE_OPTIONS: { value: RangeFilter; label: string }[] = [
  { value: "month", label: "本月" },
  { value: "today", label: "今日" },
  { value: "term", label: "本学期" },
];

export const RANGE_WORD: Record<RangeFilter, string> = {
  today: "今日",
  month: "本月",
  term: "本学期",
};

export const BASELINE_PER_CAPITA = 11.8;
export const TEACHING_DAYS = 20;
export const TERM_FACTOR = 2.2;

export function formatWan(yuan: number): string {
  const sign = yuan < 0 ? "-" : "";
  const value = Math.abs(yuan);
  if (value >= 1000) return `${sign}${(value / 10000).toFixed(2)}万`;
  return `${sign}${Math.round(value).toLocaleString("zh-CN")}`;
}

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("zh-CN");
}

export function formatYuan(value: number): string {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function maskPerson(name: string, inspection: boolean): string {
  if (!inspection || !name) return name;
  return `${name.slice(0, 1)}某`;
}

export function lossRate(inbound: number, outbound: number): number {
  if (inbound <= 0) return 0;
  return Math.round((1 - outbound / inbound) * 1000) / 10;
}

export function matchRate(inbound: number, outbound: number): number {
  if (inbound <= 0) return 0;
  return Math.round((outbound / inbound) * 1000) / 10;
}

export function bandLabel(perCapita: number): string {
  if (!perCapita) return "暂无餐标";
  const gap = perCapita - BASELINE_PER_CAPITA;
  if (Math.abs(gap) <= 1.4) return "处于全县正常区间";
  if (gap > 1.4) return "高于全县正常区间";
  return "低于全县正常区间";
}
