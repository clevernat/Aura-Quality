import React, { useState } from 'react';
// FIX: Import AgeGroup enum to resolve 'Cannot find name' error.
import { AQIData, UserProfile, HealthCondition, ActivityLevel, AgeGroup } from '../types';
import { getAqiCategory } from '../constants';
import AqiChart from './AqiChart';
import { ChevronDownIcon } from './icons';

interface SidebarProps {
  aqiData: AQIData | null;
  userProfile: UserProfile;
}

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg hover:bg-gray-700/50 transition-colors"
            >
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 pt-0">{children}</div>}
        </div>
    );
};

const getPersonalizedTips = (aqiData: AQIData, profile: UserProfile): { tips: string[], proactiveTip: string | null } => {
    const tips: string[] = [];
    const { current, forecast } = aqiData;
    const aqi = current.aqi;
    const isSensitive = profile.healthConditions.some(c => c !== HealthCondition.None) || profile.ageGroup === AgeGroup.Children || profile.ageGroup === AgeGroup.Seniors;

    // Current AQI tips
    if (aqi > 100) {
        if (isSensitive) {
            tips.push("As a member of a sensitive group, you should reduce prolonged or heavy outdoor exertion.");
            if (aqi > 150) {
                tips.push("Consider wearing a N95 mask if you must be outdoors for an extended period.");
            }
        }
        if (profile.activityLevel === ActivityLevel.High) {
            tips.push("It's highly recommended to reschedule strenuous exercise to a time when air quality is better, or move it indoors.");
        }
    }
    if (aqi > 150) {
        tips.push("Everyone should reduce heavy outdoor exertion. Keep windows and doors closed.");
        tips.push("Use air purifiers with HEPA filters if available to improve indoor air quality.");
    }
    if (aqi > 200) {
         tips.push("Avoid all outdoor physical activity. Keep sensitive individuals indoors as much as possible.");
    }
    if (tips.length === 0) {
        tips.push("Air quality is good. It's a great time for outdoor activities!");
    }
    
    // Proactive forecast tip
    let proactiveTip: string | null = null;
    const highAqiForecast = forecast.find(day => day.aqi > 100);

    if (highAqiForecast) {
        let tip = `High AQI of ${highAqiForecast.aqi} is forecasted for ${highAqiForecast.day}. `;
        if (isSensitive) {
            tip += "Plan to limit your time outdoors.";
        } else if (profile.activityLevel === ActivityLevel.High) {
            tip += "Consider planning your outdoor exercise for a different day.";
        } else {
            tip += "Be mindful of your outdoor activities.";
        }
        proactiveTip = tip;
    }

    return { tips, proactiveTip };
};


const Sidebar: React.FC<SidebarProps> = ({ aqiData, userProfile }) => {
  if (!aqiData) {
    return (
        <div className="w-full lg:w-1/3 bg-gray-800 p-4 flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
            <p className="mt-4 text-lg">Fetching Air Quality Data...</p>
        </div>
    );
  }

  const { current, forecast, historical, phenomenon } = aqiData;
  const categoryInfo = getAqiCategory(current.aqi);
  const { tips, proactiveTip } = getPersonalizedTips(aqiData, userProfile);

  return (
    <div className="w-full lg:w-1/3 bg-gray-800 overflow-y-auto h-full shadow-lg">
        <div className="p-4">
            <h2 className="text-2xl font-bold">{aqiData.locationName}</h2>
            <div className={`mt-4 p-4 rounded-lg text-white ${categoryInfo.className}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold">{categoryInfo.name}</p>
                        <p className="text-5xl font-bold">{current.aqi}</p>
                        <p className="text-sm">US AQI</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm">Primary Pollutant</p>
                        <p className="text-2xl font-bold">{current.primaryPollutant}</p>
                    </div>
                </div>
            </div>
        </div>

        <AccordionSection title="Personalized Health Tips" defaultOpen={true}>
            {proactiveTip && (
                <div className="mb-3 p-3 bg-yellow-900/50 border-l-4 border-yellow-500 rounded-r-md">
                    <p className="font-bold text-yellow-300">Proactive Tip</p>
                    <p className="text-yellow-200">{proactiveTip}</p>
                </div>
             )}
             <ul className="space-y-2 list-disc list-inside text-gray-300">
                {tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
        </AccordionSection>

        <AccordionSection title="Pollutant Breakdown">
             <div className="grid grid-cols-2 gap-4 text-sm">
                {current.pollutants.map(p => (
                    <div key={p.name} className="bg-gray-700/50 p-3 rounded-md">
                        <p className="font-bold text-lg">{p.name}</p>
                        <p className="text-gray-300">{p.value.toFixed(1)} {p.unit}</p>
                    </div>
                ))}
            </div>
        </AccordionSection>
       
        <AccordionSection title="Atmospheric Conditions">
            <div className="bg-gray-900/50 p-4 rounded-md">
                <h4 className="font-bold text-lg text-blue-300">{phenomenon.title}</h4>
                <p className="mt-2 text-gray-300">{phenomenon.explanation}</p>
            </div>
        </AccordionSection>

        <AccordionSection title="7-Day Forecast">
             <div className="flex justify-between space-x-2 text-center">
                {forecast.map(day => {
                    const cat = getAqiCategory(day.aqi);
                    return (
                        <div key={day.day} className="flex-1 bg-gray-700/50 p-2 rounded-md">
                            <p className="font-semibold text-sm">{day.day}</p>
                            <div className={`mx-auto mt-2 w-8 h-8 ${cat.className} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                                {day.aqi}
                            </div>
                        </div>
                    );
                })}
            </div>
        </AccordionSection>

        <AccordionSection title="Historical Trend" defaultOpen={true}>
            <AqiChart data={historical} />
        </AccordionSection>
    </div>
  );
};

export default Sidebar;