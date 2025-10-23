
export enum AgeGroup {
  All = "All Ages",
  Children = "Children (0-17)",
  Adults = "Adults (18-64)",
  Seniors = "Seniors (65+)",
}

export enum HealthCondition {
  None = "None",
  Asthma = "Asthma",
  COPD = "COPD",
  Cardiovascular = "Cardiovascular Disease",
  Pregnancy = "Pregnancy",
}

export enum ActivityLevel {
  Low = "Low (mostly indoors)",
  Moderate = "Moderate (some outdoor activity)",
  High = "High (regular outdoor exercise)",
}

export interface UserProfile {
  ageGroup: AgeGroup;
  healthConditions: HealthCondition[];
  activityLevel: ActivityLevel;
}

export interface Pollutant {
  name: "PM2.5" | "PM10" | "O3" | "NO2" | "SO2" | "CO";
  value: number;
  unit: string;
}

export interface AQIData {
  locationName: string;
  lat: number;
  lng: number;
  current: {
    aqi: number;
    category: string;
    color: string;
    primaryPollutant: string;
    pollutants: Pollutant[];
  };
  forecast: { day: string; aqi: number }[];
  historical: { date: string; aqi: number }[];
  phenomenon: {
    key: "inversion" | "stagnant" | "wildfire" | "seasonal" | "none";
    title: string;
    explanation: string;
  };
  alerts: {
    type: "Wildfire Smoke" | "Ozone Action Day" | "Particle Pollution";
    severity: "High" | "Moderate";
    message: string;
  }[];
}

export interface AQICategory {
  name: string;
  range: [number, number];
  className: string;
  healthImplications: string;
  cautionaryStatement: string;
}
