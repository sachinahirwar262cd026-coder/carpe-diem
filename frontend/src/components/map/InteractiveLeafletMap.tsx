import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocode, GeocodedLocation } from '../../services/api/geocodingService';
import { getAqiColor, getAqiCategory, getAqiBadgeStyle, getNoiseBadgeStyle } from '../../utils/helpers';
import { MicroPocket, NoiseHotspot, CitizenComplaint } from '../../types';
import {
  AlertTriangle,
  Volume2,
  Wind,
  Eye,
  CheckCircle2,
  Navigation,
  Crosshair,
  AlertCircle,
  Radio,
  MapPin,
} from 'lucide-react';

interface InteractiveLeafletMapProps {
  showAirHotspots: boolean;
  showNoiseHotspots: boolean;
  showComplaints: boolean;
  showUserLocation?: boolean;
  onSelectHotspot?: (item: MicroPocket | NoiseHotspot | CitizenComplaint) => void;
  onLocationFound?: (lat: number, lng: number, accuracy: number, placeName: string) => void;
}

// Controller component to smoothly center and zoom when the selected city or user GPS changes
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  flyTrigger: number;
}> = ({ center, zoom, flyTrigger }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, flyTrigger, map]);
  return null;
};

// Create custom HTML DivIcons for rich styled markers
const createAirMarkerIcon = (aqi: number) => {
  const color = getAqiColor(aqi);
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: ${color}; opacity: 0.3; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: #0f172a; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <span style="font-size: 10px; font-weight: 800; color: ${color};">${aqi}</span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createNoiseMarkerIcon = (db: number) => {
  const color = db > 80 ? '#ef4444' : '#06b6d4';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: #0f172a; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <span style="font-size: 10px; font-weight: 800; color: ${color};">${db.toFixed(0)}dB</span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createComplaintMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
        <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #f59e0b; border: 1.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4); transform: rotate(45deg);">
          <span style="font-size: 10px; font-weight: 900; color: #0f172a; transform: rotate(-45deg);">!</span>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Pulsing Blue Radar Dot for User's Real Device GPS Position
const createMyLocationIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
        <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: #3b82f6; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 26px; height: 26px; border-radius: 9999px; background-color: #2563eb; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(37, 99, 235, 0.8);">
          <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #ffffff;"></div>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  showAirHotspots,
  showNoiseHotspots,
  showComplaints,
  showUserLocation = true,
  onSelectHotspot,
  onLocationFound,
}) => {
  const { selectedCity, setSelectedCityId, setUserGpsLocation, noiseHotspots, complaints } = useApp();
  const geo = useGeolocation(false);

  const [activeCenter, setActiveCenter] = useState<[number, number]>(selectedCity.center);
  const [activeZoom, setActiveZoom] = useState<number>(selectedCity.zoom);
  const [flyTrigger, setFlyTrigger] = useState<number>(0);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string | null>(null);
  const [geocodedPlace, setGeocodedPlace] = useState<GeocodedLocation | null>(null);

  // Sync with city selector changes
  useEffect(() => {
    setActiveCenter(selectedCity.center);
    setActiveZoom(selectedCity.zoom);
    setFlyTrigger((prev) => prev + 1);
  }, [selectedCity]);

  // Handle GPS button click
  const handleLocateMe = async () => {
    setLocationStatusMessage('Acquiring high-accuracy GPS satellite fix...');
    try {
      const pos = await geo.getPosition();
      // Ensure latitude is index 0, longitude is index 1
      const coords: [number, number] = [pos.lat, pos.lng];
      setActiveCenter(coords);
      setActiveZoom(15);
      setFlyTrigger((prev) => prev + 1);

      // Perform real reverse geocoding
      const geoInfo = await reverseGeocode(pos.lat, pos.lng);
      setGeocodedPlace(geoInfo);

      setUserGpsLocation({
        lat: pos.lat,
        lng: pos.lng,
        accuracy: pos.accuracy,
        placeName: geoInfo.displayName,
      });

      // If close to a monitored city (e.g. NITK Surathkal / Mangaluru), auto-switch
      if (geoInfo.nearestMonitoredCityId) {
        setSelectedCityId(geoInfo.nearestMonitoredCityId);
      }

      setLocationStatusMessage(
        `GPS Locked: ${geoInfo.displayName} (±${Math.round(pos.accuracy)}m)`
      );

      onLocationFound?.(pos.lat, pos.lng, pos.accuracy, geoInfo.displayName);

      // Clear status message after 7 seconds
      setTimeout(() => {
        setLocationStatusMessage(null);
      }, 7000);
    } catch (err: any) {
      setLocationStatusMessage(err.message || 'Location error. Please check browser permissions.');
      setTimeout(() => {
        setLocationStatusMessage(null);
      }, 7000);
    }
  };

  const cityComplaints = complaints.filter(
    (c) =>
      c.city.toLowerCase() === selectedCity.name.toLowerCase() ||
      c.city.includes(selectedCity.name.split(' ')[0])
  );

  const cityNoiseHotspots = noiseHotspots.filter(
    (h) =>
      h.city.toLowerCase() === selectedCity.name.toLowerCase() ||
      h.city.includes(selectedCity.name.split(' ')[0])
  );

  return (
    <div className="w-full h-full min-h-[520px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative">
      {/* Floating High-Accuracy GPS Locate Button Overlay */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col items-end space-y-2 pointer-events-auto">
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={geo.isLoading}
          className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs shadow-xl backdrop-blur-md transition-all duration-200 border ${
            geo.lat !== null && geo.lng !== null
              ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/50 shadow-blue-500/25'
              : 'bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          title="Center on current device GPS location"
        >
          {geo.isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Locating GPS...</span>
            </>
          ) : (
            <>
              <Crosshair
                className={`w-4 h-4 ${geo.lat !== null ? 'text-white' : 'text-blue-500'} ${
                  geo.isLoading ? 'animate-spin' : ''
                }`}
              />
              <span>{geo.lat !== null ? 'My GPS Position' : 'Locate Me (GPS)'}</span>
            </>
          )}
        </button>

        {/* GPS Status / Location Name Pill */}
        {locationStatusMessage && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-[11px] font-medium shadow-2xl backdrop-blur-md flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-150 max-w-sm text-right">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse shrink-0" />
            <span className="truncate">{locationStatusMessage}</span>
          </div>
        )}
      </div>

      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ minHeight: '520px', background: '#090d16' }}
      >
        <MapController center={activeCenter} zoom={activeZoom} flyTrigger={flyTrigger} />

        {/* Modern CartoDB Voyager tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* 0. Live User GPS Location Marker & Accuracy Ring */}
        {showUserLocation && geo.lat !== null && geo.lng !== null && (
          <React.Fragment key="user-gps-location">
            {geo.accuracy && geo.accuracy > 0 && (
              <Circle
                center={[geo.lat, geo.lng]}
                radius={Math.min(geo.accuracy, 500)} // Bound visual radius to 500m
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  color: '#2563eb',
                  weight: 1.5,
                  dashArray: '3, 6',
                }}
              />
            )}

            <Marker position={[geo.lat, geo.lng]} icon={createMyLocationIcon()} zIndexOffset={1000}>
              <Popup>
                <div className="p-3 text-slate-900 text-xs min-w-[240px]">
                  <div className="flex items-center space-x-2 border-b pb-1.5 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                    <span className="font-black text-sm text-blue-700">Your Real GPS Location</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Detected Place:</span>
                      <span className="font-extrabold text-slate-900 text-xs">
                        {geocodedPlace ? geocodedPlace.displayName : 'Live GPS Satellite Fix'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-slate-600">Latitude:</span>
                      <span className="font-mono font-bold text-slate-900">{geo.lat.toFixed(6)}°N</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Longitude:</span>
                      <span className="font-mono font-bold text-slate-900">{geo.lng.toFixed(6)}°E</span>
                    </div>
                    {geo.accuracy && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">GPS Accuracy:</span>
                        <span className="font-bold text-emerald-700">±{Math.round(geo.accuracy)} meters</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        )}

        {/* 1. Air Quality Micro-Pockets & Heat Circles */}
        {showAirHotspots &&
          selectedCity.pockets.map((pocket) => {
            const aqiColor = getAqiColor(pocket.aqi);
            const badge = getAqiBadgeStyle(pocket.category);

            return (
              <React.Fragment key={pocket.id}>
                <Circle
                  center={[pocket.lat, pocket.lng]}
                  radius={pocket.isHotspot ? 1400 : 800}
                  pathOptions={{
                    fillColor: aqiColor,
                    fillOpacity: pocket.isHotspot ? 0.25 : 0.12,
                    color: aqiColor,
                    weight: pocket.isHotspot ? 2 : 1,
                    dashArray: pocket.isHotspot ? '4, 4' : undefined,
                  }}
                />

                <Marker
                  position={[pocket.lat, pocket.lng]}
                  icon={createAirMarkerIcon(pocket.aqi)}
                  eventHandlers={{
                    click: () => onSelectHotspot?.(pocket),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-3 text-slate-900 text-xs min-w-[220px]">
                      <div className="flex items-center justify-between font-bold border-b pb-1 mb-2">
                        <span className="text-sm">{pocket.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${badge.bg} ${badge.text}`}>
                          {pocket.category}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600">AQI Index:</span>
                          <span className="font-extrabold" style={{ color: aqiColor }}>
                            {pocket.aqi}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Primary:</span>
                          <span className="font-mono font-bold">{pocket.dominantPollutant}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Noise Est:</span>
                          <span className="font-mono font-bold text-cyan-700">{pocket.noiseDb} dB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">CPCB Station:</span>
                          <span>{pocket.cpcbStationDistance}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

        {/* 2. Noise Hotspots */}
        {showNoiseHotspots &&
          cityNoiseHotspots.map((hotspot) => {
            return (
              <React.Fragment key={hotspot.id}>
                <Circle
                  center={[hotspot.lat, hotspot.lng]}
                  radius={1100}
                  pathOptions={{
                    fillColor: '#06b6d4',
                    fillOpacity: 0.18,
                    color: '#06b6d4',
                    weight: 1.5,
                  }}
                />

                <Marker
                  position={[hotspot.lat, hotspot.lng]}
                  icon={createNoiseMarkerIcon(hotspot.currentDb)}
                  eventHandlers={{
                    click: () => onSelectHotspot?.(hotspot),
                  }}
                >
                  <Popup>
                    <div className="p-3 text-slate-900 text-xs min-w-[220px]">
                      <div className="flex items-center justify-between font-bold border-b pb-1 mb-2">
                        <span className="text-sm">{hotspot.name}</span>
                        <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold">
                          {hotspot.zoneType}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Noise Level:</span>
                          <span className="font-extrabold text-cyan-700">{hotspot.currentDb} dB(A)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Peak Recorded:</span>
                          <span className="font-bold text-rose-600">{hotspot.peakDb} dB(A)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Primary Source:</span>
                          <span className="font-medium text-slate-800">{hotspot.primarySource}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Traffic Speed:</span>
                          <span className="font-mono">{hotspot.trafficSpeedKmph} km/h</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

        {/* 3. Citizen Complaints */}
        {showComplaints &&
          cityComplaints.map((complaint) => (
            <Marker
              key={complaint.id}
              position={[complaint.lat, complaint.lng]}
              icon={createComplaintMarkerIcon()}
              eventHandlers={{
                click: () => onSelectHotspot?.(complaint),
              }}
            >
              <Popup>
                <div className="p-3 text-slate-900 text-xs min-w-[230px]">
                  <div className="flex items-center justify-between font-bold border-b pb-1 mb-2">
                    <span className="text-xs font-bold text-slate-800">{complaint.trackingNumber}</span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">
                      {complaint.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{complaint.title}</h4>
                  <p className="text-[11px] text-slate-600 mb-2 leading-tight line-clamp-2">
                    {complaint.description}
                  </p>
                  <div className="space-y-0.5 border-t pt-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-700">
                      <span>Reported By:</span>
                      <span className="font-semibold">{complaint.citizenName}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>AI Verification:</span>
                      <span className="font-bold text-emerald-700">
                        {complaint.aiVerification.confidence}% Verified
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Status:</span>
                      <span className="font-bold text-teal-700">{complaint.status}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
