import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AQIData } from '../types';

interface MapComponentProps {
  aqiData: AQIData | null;
  onMapClick: (lat: number, lng: number) => void;
}

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMap({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ aqiData, onMapClick }) => {
  const position: [number, number] = aqiData ? [aqiData.lat, aqiData.lng] : [34.0522, -118.2437]; // Default to LA

  const aqiMarkerIcon = useMemo(() => {
    if (!aqiData) return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-8 h-8 bg-gray-500 border-2 border-white rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">...</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    const aqi = aqiData.current.aqi;
    const colorClass = aqiData.current.color.replace('bg-', 'bg-');
    const hasAlerts = aqiData.alerts.length > 0;
    const alertClass = hasAlerts ? 'pulsing-alert' : '';
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-10 h-10 ${colorClass} ${alertClass} border-2 border-white rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">${aqi}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }, [aqiData]);

  return (
    <MapContainer center={position} zoom={11} scrollWheelZoom={true} className="z-0">
      <ChangeView center={position} zoom={11} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapEvents onMapClick={onMapClick} />
      {aqiData && (
        <Marker position={position} icon={aqiMarkerIcon}>
          <Popup>
            <div className="text-center font-sans">
              <strong className="text-lg">{aqiData.locationName}</strong><br/>
              AQI: {aqiData.current.aqi} ({aqiData.current.category})
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent;