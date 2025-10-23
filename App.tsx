import React, { useState, useEffect, useCallback, useRef } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import UserModal from './components/UserModal';
import Chatbot from './components/Chatbot';
import { fetchAirQualityData } from './services/airQualityService';
import { AQIData, UserProfile } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { DEFAULT_USER_PROFILE } from './constants';
import { UserIcon, MapPinIcon, SearchIcon, AlertTriangleIcon, ShareIcon } from './components/icons';

// Utility to get a location name from coordinates using reverse geocoding
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    if (!response.ok) {
        // Fallback to coordinates if API fails
        return `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`;
    }
    const data = await response.json();
    // Use the display_name from the API response
    return data.display_name || `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`;
  }
};


const App: React.FC = () => {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 34.0522, lng: -118.2437 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', DEFAULT_USER_PROFILE);
  const [searchInput, setSearchInput] = useState<string>('Los Angeles, CA');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [tooltipMessage, setTooltipMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const searchProgrammaticallySet = useRef(false);

  const getAQIData = useCallback(async (lat: number, lng: number, name: string, isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
      setError(null);
      setAqiData(null);
    } else {
        // For background refresh, don't show main loader, but can set a subtle indicator if needed
    }
    try {
      const data = await fetchAirQualityData(lat, lng, name);
      setAqiData(data);
    } catch (err) {
      setError('Failed to fetch air quality data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Effect for fetching initial data on load
  useEffect(() => {
    const fetchInitialData = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                const locationName = await reverseGeocode(latitude, longitude);
                searchProgrammaticallySet.current = true;
                setSearchInput(locationName);
                getAQIData(latitude, longitude, locationName);
            },
            (geoError) => {
                console.error("Geolocation error:", geoError);
                setError("Geolocation failed. Showing default location.");
                getAQIData(location.lat, location.lng, "Los Angeles, CA");
            },
            { timeout: 10000 }
        );
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount

  // Effect for periodic data refresh
  useEffect(() => {
    const refreshInterval = 5 * 60 * 1000; // 5 minutes

    const intervalId = setInterval(() => {
      if (aqiData && !loading) {
        getAQIData(aqiData.lat, aqiData.lng, aqiData.locationName, true);
      }
    }, refreshInterval);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [aqiData, loading, getAQIData]);

  // Effect for autocomplete suggestions
  useEffect(() => {
    if (searchProgrammaticallySet.current) {
        searchProgrammaticallySet.current = false;
        return;
    }

    if (searchInput.length < 3) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);


  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setLocation({ lat, lng });
    const locationName = await reverseGeocode(lat, lng);
    searchProgrammaticallySet.current = true;
    setSearchInput(locationName);
    getAQIData(lat, lng, locationName);
  }, [getAQIData]);
  
  const handleSuggestionClick = useCallback((suggestion: any) => {
    const { lat, lon, display_name } = suggestion;
    const newLat = parseFloat(lat);
    const newLng = parseFloat(lon);

    setLocation({ lat: newLat, lng: newLng });
    searchProgrammaticallySet.current = true;
    setSearchInput(display_name);
    setSuggestions([]); // Hide suggestions
    getAQIData(newLat, newLng, display_name);
  }, [getAQIData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    if (suggestions.length > 0) {
      // If there are suggestions, select the top one
      handleSuggestionClick(suggestions[0]);
    } else {
      // Otherwise, perform a direct search (existing logic)
      setAqiData(null);
      setLoading(true);
      setError(null);
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=1`);
          if (!response.ok) throw new Error('Geocoding API request failed');
          const data = await response.json();
          if (data && data.length > 0) {
              handleSuggestionClick(data[0]);
          } else {
              setError(`Could not find location: "${searchInput}". Please try another search term.`);
              setLoading(false);
          }
      } catch (err) {
          setError('Failed to search for location. Please check your network.');
          setLoading(false);
          console.error(err);
      }
    }
  };

  const handleShare = useCallback(async () => {
    if (!aqiData) return;

    const shareText = `Current Air Quality in ${aqiData.locationName}: AQI is ${aqiData.current.aqi} (${aqiData.current.category}).`;
    const appUrl = 'https://aura-quality-app.com';
    const fullText = `${shareText}\nCheck it out here: ${appUrl}`;
    
    const showTooltip = (text: string, type: 'success' | 'error', duration = 2000) => {
        setTooltipMessage({ text, type });
        setTimeout(() => setTooltipMessage(null), duration);
    };

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aura Quality - Air Quality Report',
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        // A DOMException with the name "AbortError" is thrown if the user cancels the share dialog.
        // We can safely ignore this error and prevent it from cluttering the console.
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error using Web Share API:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullText);
        showTooltip('Copied!', 'success');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        showTooltip('Copy failed!', 'error');
      }
    }
  }, [aqiData]);

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md p-3 flex justify-between items-center z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xl">A</div>
          <h1 className="text-xl font-bold tracking-tight">Aura Quality</h1>
        </div>
        <div className="relative flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onBlur={() => setTimeout(() => setSuggestions([]), 150)} // Hide suggestions on blur
                        placeholder="Search by city or zip code..."
                        className="w-full bg-gray-700 text-white rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <SearchIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                    </button>
                </div>
            </form>
            {suggestions.length > 0 && (
                <ul className="absolute z-20 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 shadow-lg">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.place_id}
                            onMouseDown={() => handleSuggestionClick(suggestion)} // use onMouseDown to fire before blur
                            className="px-4 py-2 text-white cursor-pointer hover:bg-gray-600 truncate"
                        >
                            {suggestion.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <div className="flex items-center space-x-2">
            <div className="relative">
                <button
                    onClick={handleShare}
                    disabled={!aqiData}
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Share current air quality"
                >
                    <ShareIcon className="w-7 h-7" />
                </button>
                {tooltipMessage && (
                    <div className={`absolute bottom-full mb-2 right-1/2 translate-x-1/2 px-3 py-1 text-white text-sm rounded-md shadow-lg whitespace-nowrap ${
                        tooltipMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                        {tooltipMessage.text}
                    </div>
                )}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Open user profile settings"
            >
              <UserIcon className="w-7 h-7" />
            </button>
        </div>
      </header>
      
      {aqiData && aqiData.alerts.length > 0 && (
        <div className="bg-red-900/80 border-b-2 border-red-600 text-white p-3 z-10 shadow-lg">
          {aqiData.alerts.map((alert, index) => (
            <div key={index} className="container mx-auto flex items-center justify-center gap-3">
              <AlertTriangleIcon className="h-6 w-6 text-red-300 flex-shrink-0 animate-pulse" />
              <div className="text-center">
                  <span className="font-bold text-red-200">{alert.type} Alert ({alert.severity}): </span>
                  <span className="text-red-100">{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="bg-red-500 text-center p-2">{error}</div>}
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-2/3 h-1/2 lg:h-full">
            <MapComponent aqiData={aqiData} onMapClick={handleMapClick} />
        </div>
        <Sidebar aqiData={aqiData} userProfile={userProfile} />
      </main>
      
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      <Chatbot aqiData={aqiData} />
    </div>
  );
};

export default App;