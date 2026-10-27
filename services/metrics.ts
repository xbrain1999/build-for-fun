import cabinJson from "../data/cabin.json";
import type {
  CabinData,
  Filters,
  MealKey,
  MealSlice,
  RankRow,
  School,
  Supplier,
} from "../types";
import { BASELINE_PER_CAPITA, TEACHING_DAYS, TERM_FACTOR } from "../constants";

export const CABIN = cabinJson as unknown as CabinData;

export const TOWN_ORDER = ["大同", "彩云", "龙庆", "竹基", "雄壁", "葵山", "五龙", "高良", "丹凤", "漾月"];

const MEALS: MealKey[] = ["self", "nutrition"];

export function schoolsForStage(filters: Filters): School[] {
  if (filters.stage === "all") return CABIN.schools;
  return CABIN.schools.filter((school) => school.stage === filters.stage);
}

function mealsOf(school: School, filters: Filters): MealSlice[] {
  if (filters.meal === "all") return MEALS.map((key) => school.meals[key]);
  return [school.meals[filters.meal]];
}

function sumSlices(slices: MealSlice[], field: keyof MealSlice): number {
  return slices.reduce((total, slice) => total + Number(slice[field] || 0), 0);
}

export function scalePeriod(value: number, filters: Filters): number {
  if (filters.range === "today") return Math.round(value / TEACHING_DAYS);
  if (filters.range === "term") return Math.round(value * TERM_FACTOR);
  return value;
}

export function schoolOrder(school: School, filters: Filters): number {
  return scalePeriod(sumSlices(mealsOf(school, filters), "orderAmount"), filters);
}

export function schoolInbound(school: School, filters: Filters): number {
  return scalePeriod(sumSlices(mealsOf(school, filters), "inboundAmount"), filters);
}

export function schoolOutbound(school: School, filters: Filters): number {
  return scalePeriod(sumSlices(mealsOf(school, filters), "outboundAmount"), filters);
}

export function schoolVerify(school: School, filters: Filters): number {
  const slices = mealsOf(school, filters).filter((slice) => slice.orderAmount > 0);
  if (!slices.length) return 0;
  const weight = slices.reduce((total, slice) => total + slice.orderAmount, 0);
  const weighted = slices.reduce((total, slice) => total + slice.verifyRate * slice.orderAmount, 0);
  return Math.round((weighted / weight) * 10) / 10;
}

export function schoolPerCapita(school: School, filters: Filters): number {
  const slices = mealsOf(school, filters).filter((slice) => slice.perCapita > 0 && slice.orderAmount > 0);
  if (!slices.length) return 0;
  const weight = slices.reduce((total, slice) => total + slice.orderAmount, 0);
  const weighted = slices.reduce((total, slice) => total + slice.perCapita * slice.orderAmount, 0);
  return Math.round((weighted / weight) * 10) / 10;
}

function countSchools(schools: School[], pick: (school: School) => number): number {
  return schools.filter((school) => pick(school) > 0).length;
}

function pipeline(schools: School[], filters: Filters, amountKey: keyof MealSlice, countKey: keyof MealSlice) {
  const amount = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), amountKey), 0);
  const count = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), countKey), 0);
  const active = countSchools(schools, (school) => sumSlices(mealsOf(school, filters), amountKey));
  return { amount, count, schools: active };
}

export interface FunnelModel {
  orderAmount: number;
  orderCount: number;
  orderSchools: number;
  readyAmount: number;
  readyCount: number;
  readySchools: number;
  checkAmount: number;
  checkCount: number;
  checkSchools: number;
  waitInAmount: number;
  waitInCount: number;
  waitInSchools: number;
  inboundAmount: number;
  inboundCount: number;
  inboundSchools: number;
  outboundAmount: number;
  outboundCount: number;
  outboundSchools: number;
  loss: number;
  match: number;
  turnover: number;
  onTime: number;
}

export function buildFunnel(filters: Filters): FunnelModel {
  const schools = schoolsForStage(filters);
  const orderAmount = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), "orderAmount"), 0);
  const orderCount = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), "orderCount"), 0);
  const inboundRaw = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), "inboundAmount"), 0);
  const outboundRaw = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), "outboundAmount"), 0);
  const inboundCount = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), "inboundCount"), 0);
  const outboundCount = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), "outboundCount"), 0);
  const ready = pipeline(schools, filters, "waitReadyAmount", "waitReadyCount");
  const check = pipeline(schools, filters, "waitCheckAmount", "waitCheckCount");
  const waitIn = pipeline(schools, filters, "waitInboundAmount", "waitInboundCount");
  const inboundAmount = scalePeriod(inboundRaw, filters);
  const outboundAmount = scalePeriod(outboundRaw, filters);
  const loss = inboundAmount > 0 ? Math.round((1 - outboundAmount / inboundAmount) * 1000) / 10 : 0;
  const match = inboundAmount > 0 ? Math.round((outboundAmount / inboundAmount) * 1000) / 10 : 0;
  return {
    orderAmount: scalePeriod(orderAmount, filters),
    orderCount: scalePeriod(orderCount, filters),
    orderSchools: countSchools(schools, (school) => sumSlices(mealsOf(school, filters), "orderAmount")),
    readyAmount: ready.amount,
    readyCount: ready.count,
    readySchools: ready.schools,
    checkAmount: check.amount,
    checkCount: check.count,
    checkSchools: check.schools,
    waitInAmount: waitIn.amount,
    waitInCount: waitIn.count,
    waitInSchools: waitIn.schools,
    inboundAmount,
    inboundCount: scalePeriod(inboundCount, filters),
    inboundSchools: countSchools(schools, (school) => sumSlices(mealsOf(school, filters), "inboundAmount")),
    outboundAmount,
    outboundCount: scalePeriod(outboundCount, filters),
    outboundSchools: countSchools(schools, (school) => sumSlices(mealsOf(school, filters), "outboundAmount")),
    loss,
    match,
    turnover: inboundAmount - outboundAmount,
    onTime: onTimeRate(schools, filters),
  };
}

function onTimeRate(schools: School[], filters: Filters): number {
  if (filters.stage === "primary" && filters.meal === "self") return 98;
  const suppliers = new Map(CABIN.suppliers.map((supplier) => [supplier.id, supplier.onTime]));
  let weight = 0;
  let score = 0;
  schools.forEach((school) => {
    const amount = sumSlices(mealsOf(school, filters), "orderAmount");
    if (amount <= 0) return;
    weight += amount;
    score += amount * (suppliers.get(school.supplierId) || 0);
  });
  if (!weight) return 0;
  return Math.round(score / weight);
}

export function alertLists(filters: Filters) {
  const schools = schoolsForStage(filters);
  const byHours = (left: School, right: School) => right.overdueHours - left.overdueHours;
  return {
    missing: schools.filter((school) => school.missingOrder),
    overdue: schools.filter((school) => school.overdueInbound).sort(byHours),
    rest: schools.filter((school) => school.rest),
  };
}

export function rankRows(filters: Filters): RankRow[] {
  return schoolsForStage(filters)
    .map((school) => {
      const perCapita = schoolPerCapita(school, filters);
      return {
        school,
        amount: schoolOrder(school, filters),
        verifyRate: schoolVerify(school, filters),
        perCapita,
        deviation: perCapita ? Math.round((perCapita - BASELINE_PER_CAPITA) * 10) / 10 : 0,
      };
    })
    .filter((row) => row.amount > 0);
}

export interface TrendPoint {
  date: string;
  label: string;
  inbound: number;
  outbound: number;
  match: number;
}

export function trendSeries(filters: Filters): TrendPoint[] {
  const schools = schoolsForStage(filters);
  const inbound = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), "inboundAmount"), 0);
  const outbound = schools.reduce((total, school) => total + sumSlices(mealsOf(school, filters), "outboundAmount"), 0);
  const points = CABIN.trendShape.map((day, index) => {
    const wave = Math.sin(index * 1.17) * 1.05 + ((index % 4) - 1.5) * 0.18;
    return {
      date: day.date,
      label: day.date.slice(5),
      inbound: inbound * day.w,
      outbound: outbound * day.w,
      match: 97.9 + wave,
    };
  });
  const average = points.reduce((total, point) => total + point.match, 0) / points.length;
  return points.map((point) => ({
    ...point,
    match: Math.round((point.match - average + 97.9) * 10) / 10,
  }));
}

export function supplierRows(filters: Filters): { supplier: Supplier; schools: number; amount: number }[] {
  const schools = schoolsForStage(filters);
  return CABIN.suppliers.map((supplier) => {
    const mine = schools.filter((school) => school.supplierId === supplier.id);
    const amount = mine.reduce((total, school) => total + sumSlices(mealsOf(school, filters), "orderAmount"), 0);
    return {
      supplier,
      schools: mine.filter((school) => sumSlices(mealsOf(school, filters), "orderAmount") > 0).length,
      amount: scalePeriod(amount, filters),
    };
  });
}

export function featuredSchool(town: string, filters: Filters): School | null {
  const pool = schoolsForStage(filters)
    .filter((school) => school.town === town && school.mapStatus === "ok" && schoolOrder(school, filters) > 0)
    .sort((left, right) => schoolOrder(right, filters) - schoolOrder(left, filters));
  const flagship = pool.find((school) => schoolVerify(school, filters) >= 98 && !school.shortName.includes("特殊"));
  return flagship || pool[0] || schoolsForStage(filters).find((school) => school.town === town) || null;
}

export function findSchool(id: string): School | undefined {
  return CABIN.schools.find((school) => school.id === id);
}

export function findSupplier(id: string): Supplier | undefined {
  return CABIN.suppliers.find((supplier) => supplier.id === id);
}

export function schoolsInPipeline(filters: Filters, field: keyof MealSlice): School[] {
  return schoolsForStage(filters)
    .filter((school) => sumSlices(mealsOf(school, filters), field) > 0)
    .sort((left, right) => sumSlices(mealsOf(right, filters), field) - sumSlices(mealsOf(left, filters), field));
}

export function sliceAmount(school: School, filters: Filters, field: keyof MealSlice): number {
  const amount = sumSlices(mealsOf(school, filters), field);
  if (field === "orderAmount" || field === "inboundAmount" || field === "outboundAmount" || field === "orderCount" || field === "inboundCount" || field === "outboundCount") {
    return scalePeriod(amount, filters);
  }
  return amount;
}
