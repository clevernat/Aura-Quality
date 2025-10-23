import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import UserModal from './components/UserModal';
import Chatbot from './components/Chatbot';
import { fetchAirQualityData } from './services/airQualityService';
import { AQIData, UserProfile } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { DEFAULT_USER_PROFILE } from './constants';
import { UserIcon, MapPinIcon, SearchIcon, AlertTriangleIcon } from './components/icons';

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
  
  useEffect(() => {
    const fetchInitialData = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                const locationName = await reverseGeocode(latitude, longitude);
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

  useEffect(() => {
    const refreshInterval = 5 * 60 * 1000; // 5 minutes

    const intervalId = setInterval(() => {
      // Refresh only if there is data to refresh and we are not already loading.
      if (aqiData && !loading) {
        getAQIData(aqiData.lat, aqiData.lng, aqiData.locationName, true);
      }
    }, refreshInterval);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [aqiData, loading, getAQIData]);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setLocation({ lat, lng });
    const locationName = await reverseGeocode(lat, lng);
    setSearchInput(locationName);
    getAQIData(lat, lng, locationName);
  }, [getAQIData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setAqiData(null);
    setLoading(true);
    setError(null);
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=1`);
        if (!response.ok) {
            throw new Error('Geocoding API request failed');
        }
        const data = await response.json();

        if (data && data.length > 0) {
            const { lat, lon, display_name } = data[0];
            const newLat = parseFloat(lat);
            const newLng = parseFloat(lon);
            
            setLocation({ lat: newLat, lng: newLng });
            setSearchInput(display_name); // Update search input to the official name
            getAQIData(newLat, newLng, display_name);
        } else {
            setError(`Could not find location: "${searchInput}". Please try another search term.`);
            setLoading(false); // Stop loading as getAQIData won't be called
        }
    } catch (err) {
        setError('Failed to search for location. Please check your network.');
        setLoading(false); // Stop loading as getAQIData won't be called
        console.error(err);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md p-3 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xl">A</div>
          <h1 className="text-xl font-bold tracking-tight">Aura Quality</h1>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by city or zip code..."
                    className="w-full bg-gray-700 text-white rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                 <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <SearchIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                </button>
            </div>
        </form>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Open user profile settings"
        >
          <UserIcon className="w-7 h-7" />
        </button>
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