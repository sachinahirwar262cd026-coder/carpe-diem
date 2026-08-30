import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { getAqiColor, getAqiCategory, getAqiBadgeStyle, getNoiseBadgeStyle } from '../../utils/helpers';
import { MicroPocket, NoiseHotspot, CitizenComplaint } from '../../types';
import { AlertTriangle, Volume2, Wind, Eye, CheckCircle2 } from 'lucide-react';

interface InteractiveLeafletMapProps {
  showAirHotspots: boolean;
  showNoiseHotspots: boolean;
  showComplaints: boolean;
  onSelectHotspot?: (item: MicroPocket | NoiseHotspot | CitizenComplaint) => void;
}

// Controller component to smoothly center and zoom when the selected city changes
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
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

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  showAirHotspots,
  showNoiseHotspots,
  showComplaints,
  onSelectHotspot,
}) => {
  const { selectedCity, noiseHotspots, complaints } = useApp();

  const cityComplaints = complaints.filter(
    (c) => c.city.toLowerCase() === selectedCity.name.toLowerCase() || c.city.includes(selectedCity.name.split(' ')[0])
  );

  const cityNoiseHotspots = noiseHotspots.filter(
    (h) => h.city.toLowerCase() === selectedCity.name.toLowerCase() || h.city.includes(selectedCity.name.split(' ')[0])
  );

  return (
    <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <MapContainer
        center={selectedCity.center}
        zoom={selectedCity.zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ minHeight: '520px', background: '#090d16' }}
      >
        <MapController center={selectedCity.center} zoom={selectedCity.zoom} />

        {/* Dark Modern CartoDB / OSM tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

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
                          <span className="font-extrabold" style={{ color: aqiColor }}>{pocket.aqi}</span>
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
            const badge = getNoiseBadgeStyle(hotspot.currentDb);

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
                      <span className="font-bold text-emerald-700">{complaint.aiVerification.confidence}% Verified</span>
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
