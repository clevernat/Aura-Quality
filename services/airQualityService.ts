
import { AQIData, Pollutant } from '../types';
import { getAqiCategory } from '../constants';

// Helper to generate random number in a range
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePollutants = (aqi: number): Pollutant[] => {
    return [
        { name: "PM2.5", value: random(aqi > 50 ? 12 : 0, aqi > 50 ? aqi / 4 : 12), unit: "µg/m³" },
        { name: "PM10", value: random(aqi > 50 ? 55 : 0, aqi > 50 ? aqi / 2 : 54), unit: "µg/m³" },
        { name: "O3", value: random(aqi > 100 ? 71 : 0, aqi > 100 ? aqi / 2.5 : 70), unit: "ppb" },
        { name: "NO2", value: random(0, aqi / 5), unit: "ppb" },
        { name: "SO2", value: random(0, aqi / 8), unit: "ppb" },
        { name: "CO", value: random(0, aqi / 20), unit: "ppm" },
    ];
};

// FIX: Explicitly type the phenomena array to match the AQIData interface.
const phenomena: AQIData['phenomenon'][] = [
    { key: "inversion", title: "Atmospheric Inversion", explanation: "A temperature inversion is occurring, trapping pollutants close to the ground and increasing concentrations. This typically happens in calm weather conditions, especially overnight and in the early morning." },
    { key: "stagnant", title: "Stagnant Air Mass", explanation: "A slow-moving high-pressure system is causing the air to stagnate. This lack of wind prevents pollutants from dispersing, leading to a gradual buildup of poor air quality over the area." },
    { key: "wildfire", title: "Wildfire Smoke", explanation: "Smoke from distant wildfires is being transported into the region. This smoke contains high levels of fine particulate matter (PM2.5), significantly impacting air quality." },
    { key: "seasonal", title: "Seasonal Ozone", explanation: "Warm temperatures and sunlight are reacting with pollutants like NOx to form ground-level ozone, a common issue during summer months. Ozone levels are typically highest in the afternoon." },
];

const alerts = [
    { type: "Wildfire Smoke", severity: "High", message: "Air quality is heavily impacted by wildfire smoke. Sensitive groups and the general public should avoid outdoor activities." },
    { type: "Ozone Action Day", severity: "Moderate", message: "High ozone levels are expected. Limit strenuous outdoor activity, especially during the afternoon." },
    { type: "Particle Pollution", severity: "High", message: "High levels of particle pollution detected. All individuals should reduce exposure by staying indoors." },
];

const generateMockData = (lat: number, lng: number, locationName: string): AQIData => {
    const aqi = random(10, 350);
    const categoryInfo = getAqiCategory(aqi);

    const forecast = Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
        aqi: Math.max(10, aqi + random(-30, 30)),
    }));

    const historical = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        aqi: Math.max(10, aqi + random(-50, 50)),
    }));

    let activePhenomenon = phenomena[3]; // default seasonal
    if (aqi > 150) activePhenomenon = phenomena[random(0,2)];
    
    let activeAlerts = [];
    if (aqi > 150 && Math.random() > 0.3) {
        activeAlerts.push(alerts[random(0, alerts.length - 1)]);
    }

    return {
        locationName,
        lat,
        lng,
        current: {
            aqi,
            category: categoryInfo.name,
            color: categoryInfo.className,
            primaryPollutant: "PM2.5",
            pollutants: generatePollutants(aqi),
        },
        forecast,
        historical,
        phenomenon: activePhenomenon,
        alerts: activeAlerts,
    };
};

// This is a mock API service. It simulates a network request.
export const fetchAirQualityData = (lat: number, lng: number, locationName: string = "Selected Location"): Promise<AQIData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(generateMockData(lat, lng, locationName));
        }, 1000); // Simulate 1 second network delay
    });
};