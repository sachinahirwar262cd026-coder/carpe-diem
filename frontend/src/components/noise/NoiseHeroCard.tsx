import React from 'react';
import { Volume2, AlertTriangle, Activity, Car, Waves } from 'lucide-react';
import { CityData, NoiseHotspot } from '../../types';
import { getNoiseBadgeStyle } from '../../utils/helpers';

interface NoiseHeroCardProps {
  city: CityData;
  hotspot?: NoiseHotspot | null;
}

export const NoiseHeroCard: React.FC<NoiseHeroCardProps> = ({ city, hotspot }) => {
  const currentDb = hotspot ? hotspot.currentDb : city.currentNoise;
  const peakDb = hotspot ? hotspot.peakDb : city.currentNoise + 8.4;
  const source = hotspot ? hotspot.primarySource : 'Traffic & Horns';
  const badgeStyle = getNoiseBadgeStyle(currentDb);
  const violation = Math.max(0, currentDb - (hotspot ? hotspot.standardLimit : 65));

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Acoustic Surveillance (CORTN Model)
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Virtual Sensor Synthesis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {hotspot ? hotspot.name : `${city.name} Noise Monitoring`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {hotspot ? `${hotspot.zoneType} Zone · ${hotspot.city}` : `${city.state} Urban Acoustic Grid`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {badgeStyle.label}
          </span>
          {violation > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>+{violation.toFixed(1)} dB Above CPCB Cap</span>
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Decibel Display & Waveform Simulation */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Acoustic Pressure
            </span>
            <span className="text-xs font-mono text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-800/40">
              A-Weighted dB(A)
            </span>
          </div>

          <div className="my-4 flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentDb}
            </span>
            <span className="text-base font-bold text-blue-600 dark:text-cyan-400">dB(A)</span>
          </div>

          {/* Acoustic Waveform */}
          <div className="space-y-1.5">
            <div className="flex items-end justify-between h-10 gap-1 px-1">
              {[40, 65, 85, 45, 95, 70, 80, 60, 90, 75, 88, 55, 68, 92, 74, 62, 85, 50, 78, 88].map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-t bg-blue-500 dark:bg-cyan-500"
                  style={{
                    height: `${Math.min(Math.max(h * (currentDb / 85), 15), 100)}%`,
                    opacity: 0.6 + (i % 3) * 0.2,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              <span>Low (63Hz)</span>
              <span>Mid (1kHz)</span>
              <span>High (8kHz)</span>
            </div>
          </div>
        </div>

        {/* Breakdown of Parameters */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Peak Sound Level</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{peakDb.toFixed(1)} dB(A)</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Peak traffic congestion window</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                <Car className="w-4 h-4 text-amber-500" />
                <span>Primary Sound Source</span>
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white truncate">{source}</p>
              <p className="text-[11px] text-emerald-600 dark:text-teal-400 mt-0.5">AI Confidence: {hotspot ? hotspot.aiConfidence : 96.8}%</p>
            </div>
          </div>

          {/* CORTN Engine Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Waves className="w-4 h-4 text-blue-600 dark:text-teal-400" />
                <span>CORTN Traffic Noise Engine</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Virtual Sensing</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculated dynamically from vehicular speed ({hotspot ? hotspot.trafficSpeedKmph : 18} km/h), vehicle density distribution, and road gradient geometry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
