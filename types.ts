
export type Language = 'en' | 'zh';

export enum EnergyLevel {
  LOW = "LOW",
  MODERATE = "MODERATE",
  HIGH = "HIGH"
}

export enum WeatherType {
  SUNNY = "SUNNY",
  RAINY = "RAINY"
}

export enum DurationType {
  HALF_DAY = "HALF_DAY",
  FULL_DAY = "FULL_DAY"
}

export interface FormData {
  childAge: number;
  energyLevel: EnergyLevel;
  location: string;
  weather: WeatherType;
  duration: DurationType;
  interests: string[];
  indoorOnly: boolean;
}

export interface ActivityDetail {
  time: string;
  name: string; // Creative Display Name
  locationName: string; // Precise Name for Search/Maps
  description: string;
  matchReason: string; // "Why this fits"
}

export interface BackupPlan {
  name: string;
  description: string;
}

export interface ItineraryResponse {
  mainActivity: ActivityDetail;
  dining: ActivityDetail;
  backupPlan: BackupPlan;
  proTip: string;
}
