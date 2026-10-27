export type Stage = "primary" | "middle" | "kindergarten";
export type MealKey = "self" | "nutrition";
export type MapStatus = "ok" | "checking" | "alert" | "missing" | "rest";

export type StageFilter = Stage | "all";
export type MealFilter = MealKey | "all";
export type RangeFilter = "today" | "month" | "term";

export interface Filters {
  stage: StageFilter;
  meal: MealFilter;
  range: RangeFilter;
}

export interface MealSlice {
  orderAmount: number;
  orderCount: number;
  waitReadyAmount: number;
  waitReadyCount: number;
  waitCheckAmount: number;
  waitCheckCount: number;
  waitInboundAmount: number;
  waitInboundCount: number;
  inboundAmount: number;
  inboundCount: number;
  outboundAmount: number;
  outboundCount: number;
  verifyRate: number;
  perCapita: number;
}

export interface Batch {
  id: string;
  time: string;
  goods: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
  meal: MealKey;
  status: string;
  inspectors: string[];
  certNo: string;
  pesticide: string;
  photoNote: string;
}

export interface School {
  id: string;
  fullName: string;
  shortName: string;
  town: string;
  stage: Stage;
  lng: number;
  lat: number;
  students: number;
  director: string;
  phone: string;
  supplierId: string;
  mapStatus: MapStatus;
  rest: boolean;
  missingOrder: boolean;
  overdueInbound: boolean;
  overdueHours: number;
  blockReason: string;
  meals: Record<MealKey, MealSlice>;
  batches: Batch[];
}

export interface Shortage {
  school: string;
  goods: string;
  qty: string;
  eta: string;
}

export interface Supplier {
  id: string;
  shortName: string;
  fullName: string;
  onTime: number;
  qualified: number;
  returns: number;
  towns: string[];
  tag: string;
  warn: boolean;
  shortages: Shortage[];
}

export interface TrendWeight {
  date: string;
  w: number;
}

export interface CabinData {
  refreshedAt: string;
  title: string;
  cabin: string;
  pilot: string;
  schools: School[];
  suppliers: Supplier[];
  ticker: string[];
  trendShape: TrendWeight[];
  safety: { photoRate: number; pesticideRate: number; ticketRate: number };
}

export interface TownProps {
  code: string;
  name: string;
  fullName: string;
  label: [number, number];
}

export interface TownFeature {
  type: "Feature";
  properties: TownProps;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface TownCollection {
  type: "FeatureCollection";
  features: TownFeature[];
}

export type DrawerState =
  | { kind: "missing" }
  | { kind: "overdue" }
  | { kind: "rest" }
  | { kind: "ready" }
  | { kind: "check" }
  | { kind: "order" }
  | { kind: "inbound" }
  | { kind: "outbound" }
  | { kind: "safety" }
  | { kind: "school"; schoolId: string; tab?: SchoolTab }
  | { kind: "supplier"; supplierId: string };

export type SchoolTab = "batches" | "photos" | "ledger";

export type ModalState =
  | { kind: "voucher"; schoolId: string; batchId: string }
  | { kind: "briefing" };

export interface RankRow {
  school: School;
  amount: number;
  verifyRate: number;
  perCapita: number;
  deviation: number;
}
