import React from 'react';
import { Wind, Volume2, FileWarning, Layers, Navigation, Crosshair } from 'lucide-react';

interface MapFilterControlsProps {
  showAirHotspots: boolean;
  setShowAirHotspots: (val: boolean) => void;
  showNoiseHotspots: boolean;
  setShowNoiseHotspots: (val: boolean) => void;
  showComplaints: boolean;
  setShowComplaints: (val: boolean) => void;
  showUserLocation?: boolean;
  setShowUserLocation?: (val: boolean) => void;
}

export const MapFilterControls: React.FC<MapFilterControlsProps> = ({
  showAirHotspots,
  setShowAirHotspots,
  showNoiseHotspots,
  setShowNoiseHotspots,
  showComplaints,
  setShowComplaints,
  showUserLocation = true,
  setShowUserLocation,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl backdrop-blur-md">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
        <Layers className="w-4 h-4 text-teal-500" />
        <span>Map Layers:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle Air Hotspots */}
        <button
          onClick={() => setShowAirHotspots(!showAirHotspots)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            showAirHotspots
              ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/10'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Air Quality Pockets</span>
        </button>

        {/* Toggle Noise Hotspots */}
        <button
          onClick={() => setShowNoiseHotspots(!showNoiseHotspots)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            showNoiseHotspots
              ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Noise Decibel Hotspots</span>
        </button>

        {/* Toggle Citizen Complaints */}
        <button
          onClick={() => setShowComplaints(!showComplaints)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            showComplaints
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <FileWarning className="w-3.5 h-3.5" />
          <span>Citizen Evidence Pins</span>
        </button>

        {/* Toggle User GPS Location */}
        {setShowUserLocation && (
          <button
            onClick={() => setShowUserLocation(!showUserLocation)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              showUserLocation
                ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 opacity-60'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>My GPS Location</span>
          </button>
        )}
      </div>

      {/* Mini Legend */}
      <div className="hidden lg:flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Good</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>Poor</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Severe</span>
        </div>
      </div>
    </div>
  );
};
