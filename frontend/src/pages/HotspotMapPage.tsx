import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Wind,
  Volume2,
  FileWarning,
  Layers,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Navigation,
  Crosshair,
  Radio,
} from 'lucide-react';
import { InteractiveLeafletMap } from '../components/map/InteractiveLeafletMap';
import { MapFilterControls } from '../components/map/MapFilterControls';
import { MicroPocket, NoiseHotspot, CitizenComplaint } from '../types';
import { getAqiBadgeStyle, getAqiCategory, getNoiseBadgeStyle } from '../utils/helpers';

export const HotspotMapPage: React.FC = () => {
  const { selectedCity, noiseHotspots, complaints } = useApp();

  const [showAirHotspots, setShowAirHotspots] = useState(true);
  const [showNoiseHotspots, setShowNoiseHotspots] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(true);

  const [selectedEntity, setSelectedEntity] = useState<
    MicroPocket | NoiseHotspot | CitizenComplaint | { type: 'gps'; lat: number; lng: number; accuracy: number; placeName: string } | null
  >(null);

  const totalHotspots = selectedCity.pockets.filter((p) => p.isHotspot).length + noiseHotspots.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            <MapPin className="w-4 h-4" />
            <span>Geospatial AI Cluster Intelligence & GPS Surveillance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {selectedCity.name} · Multi-Layer Hotspot Map
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Geospatial fusion of atmospheric particulate dispersion, CORTN acoustic grids, geotagged citizen complaints, and your real live device GPS position.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40">
            {totalHotspots} High-Priority Hotspots Mapped
          </span>
        </div>
      </div>

      {/* Layer Controls Bar */}
      <MapFilterControls
        showAirHotspots={showAirHotspots}
        setShowAirHotspots={setShowAirHotspots}
        showNoiseHotspots={showNoiseHotspots}
        setShowNoiseHotspots={setShowNoiseHotspots}
        showComplaints={showComplaints}
        setShowComplaints={setShowComplaints}
        showUserLocation={showUserLocation}
        setShowUserLocation={setShowUserLocation}
      />

      {/* Main Map & Interactive Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Full-Feature Leaflet Map with GPS Overlay */}
        <div className="lg:col-span-8 min-h-[550px] flex flex-col">
          <InteractiveLeafletMap
            showAirHotspots={showAirHotspots}
            showNoiseHotspots={showNoiseHotspots}
            showComplaints={showComplaints}
            showUserLocation={showUserLocation}
            onSelectHotspot={(entity) => setSelectedEntity(entity)}
            onLocationFound={(lat, lng, accuracy, placeName) => {
              setSelectedEntity({ type: 'gps', lat, lng, accuracy, placeName });
            }}
          />
        </div>

        {/* Dynamic Detail Inspector Card */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                Spatial Feature Inspector
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live GPS Link</span>
            </div>

            {selectedEntity ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
                {/* Live Device GPS Entity */}
                {'type' in selectedEntity && selectedEntity.type === 'gps' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Your Real Device GPS Position</h3>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Reverse Geocoded Place:</span>
                        <span className="font-extrabold text-blue-900 dark:text-blue-200 text-xs">
                          {selectedEntity.placeName}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-blue-200 dark:border-blue-800/60">
                        <span className="text-slate-600 dark:text-slate-400">Latitude:</span>
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                          {selectedEntity.lat.toFixed(6)}°N
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Longitude:</span>
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                          {selectedEntity.lng.toFixed(6)}°E
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">GPS Accuracy:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ±{Math.round(selectedEntity.accuracy)} meters
                        </span>
                      </div>
                      <p className="pt-2 text-[11px] text-slate-600 dark:text-slate-300 border-t border-blue-200 dark:border-blue-800/80">
                        Map successfully centered on your live coordinates via HTML5 Geolocation API with high accuracy enabled.
                      </p>
                    </div>
                  </div>
                )}

                {/* Air Pocket Entity */}
                {'aqi' in selectedEntity && (
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {(selectedEntity as MicroPocket).name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{(selectedEntity as MicroPocket).city}</p>
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">AQI Index:</span>
                        <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">
                          {(selectedEntity as MicroPocket).aqi}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-bold text-amber-500">{(selectedEntity as MicroPocket).category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dominant Stressor:</span>
                        <span className="font-mono text-slate-800 dark:text-white">
                          {(selectedEntity as MicroPocket).dominantPollutant}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Noise Level:</span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">
                          {(selectedEntity as MicroPocket).noiseDb} dB(A)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">CPCB Station Gap:</span>
                        <span>{(selectedEntity as MicroPocket).cpcbStationDistance}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Noise Hotspot Entity */}
                {'currentDb' in selectedEntity && (
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {(selectedEntity as NoiseHotspot).name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{(selectedEntity as NoiseHotspot).city}</p>
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sound Pressure:</span>
                        <span className="font-extrabold text-cyan-600 dark:text-cyan-400 text-sm">
                          {(selectedEntity as NoiseHotspot).currentDb} dB(A)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Peak Level:</span>
                        <span className="font-bold text-rose-500 font-mono">
                          {(selectedEntity as NoiseHotspot).peakDb} dB(A)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Source:</span>
                        <span className="font-medium text-slate-800 dark:text-white">
                          {(selectedEntity as NoiseHotspot).primarySource}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Traffic Speed:</span>
                        <span>{(selectedEntity as NoiseHotspot).trafficSpeedKmph} km/h</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Citizen Complaint Entity */}
                {'trackingNumber' in selectedEntity && (
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {(selectedEntity as CitizenComplaint).title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{(selectedEntity as CitizenComplaint).city}</p>
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tracking Ref:</span>
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                          {(selectedEntity as CitizenComplaint).trackingNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Citizen:</span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {(selectedEntity as CitizenComplaint).citizenName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">AI Confidence:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {(selectedEntity as CitizenComplaint).aiVerification.confidence}%
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pt-1 border-t border-slate-200 dark:border-slate-800">
                        {(selectedEntity as CitizenComplaint).description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                <p className="font-semibold text-slate-800 dark:text-slate-300">Click Any Map Marker or "Locate Me"</p>
                <p className="text-[11px]">
                  Inspect real-time telemetry, model metrics, active complaints, or your live GPS location fix.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>DBSCAN Epsilon: 500m</span>
            <span>GPS Satellite Fix Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
