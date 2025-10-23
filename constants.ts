
import { AQICategory, UserProfile, AgeGroup, HealthCondition, ActivityLevel } from './types';

export const AQI_CATEGORIES: Record<string, AQICategory> = {
  Good: {
    name: "Good",
    range: [0, 50],
    className: "bg-green-500",
    healthImplications: "Air quality is considered satisfactory, and air pollution poses little or no risk.",
    cautionaryStatement: "Enjoy your usual outdoor activities.",
  },
  Moderate: {
    name: "Moderate",
    range: [51, 100],
    className: "bg-yellow-500",
    healthImplications: "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.",
    cautionaryStatement: "Unusually sensitive people should consider reducing prolonged or heavy exertion outdoors.",
  },
  UnhealthySensitive: {
    name: "Unhealthy for Sensitive Groups",
    range: [101, 150],
    className: "bg-orange-500",
    healthImplications: "Members of sensitive groups may experience health effects. The general public is not likely to be affected.",
    cautionaryStatement: "People with heart or lung disease, older adults, and children should reduce prolonged or heavy exertion.",
  },
  Unhealthy: {
    name: "Unhealthy",
    range: [151, 200],
    className: "bg-red-500",
    healthImplications: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.",
    cautionaryStatement: "Everyone should reduce prolonged or heavy exertion. It's advisable to reschedule strenuous activities outdoors.",
  },
  VeryUnhealthy: {
    name: "Very Unhealthy",
    range: [201, 300],
    className: "bg-purple-500",
    healthImplications: "Health alert: everyone may experience more serious health effects.",
    cautionaryStatement: "Everyone should avoid all outdoor exertion.",
  },
  Hazardous: {
    name: "Hazardous",
    range: [301, 500],
    className: "bg-maroon-700",
    healthImplications: "Health warnings of emergency conditions. The entire population is more likely to be affected.",
    cautionaryStatement: "Everyone should remain indoors and keep activity levels low.",
  },
};

export const getAqiCategory = (aqi: number): AQICategory => {
  if (aqi <= 50) return AQI_CATEGORIES.Good;
  if (aqi <= 100) return AQI_CATEGORIES.Moderate;
  if (aqi <= 150) return AQI_CATEGORIES.UnhealthySensitive;
  if (aqi <= 200) return AQI_CATEGORIES.Unhealthy;
  if (aqi <= 300) return AQI_CATEGORIES.VeryUnhealthy;
  return AQI_CATEGORIES.Hazardous;
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  ageGroup: AgeGroup.All,
  healthConditions: [HealthCondition.None],
  activityLevel: ActivityLevel.Moderate,
};
