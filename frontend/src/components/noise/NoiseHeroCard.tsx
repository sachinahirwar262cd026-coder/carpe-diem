import React from 'react';
import { Volume2, AlertTriangle, Activity, Car, Factory, Music, Waves } from 'lucide-react';
import { CityData, NoiseHotspot } from '../../types';
import { getNoiseBadgeStyle } from '../../utils/helpers';

interface NoiseHeroCardProps {
  city: CityData;
  hotspot?: NoiseHotspot | null;
}

export const NoiseHeroCard: React.FC<NoiseHeroCardProps> = ({ city, hotspot }) => {
  const currentDb = hotspot ? hotspot.currentDb : city.currentNoise;
  const peakDb = hotspot ? hotspot.peakDb : (city.currentNoise + 8.4);
  const source = hotspot ? hotspot.primarySource : 'Traffic Congestion';
  const badgeStyle = getNoiseBadgeStyle(currentDb);
  const violation = Math.max(0, currentDb - (hotspot ? hotspot.standardLimit : 65));

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Acoustic Telemetry & CORTN Estimation
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">No Physical Mic Array Needed</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
            {hotspot ? hotspot.name : `${city.name} Ambient Noise Index`}
          </h2>
          <p className="text-xs text-slate-400">
            {hotspot ? `${hotspot.zoneType} Zone · ${hotspot.city}` : `${city.state} Metropolitan Monitoring`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {badgeStyle.label}
          </span>
          {violation > 0 && (
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>+{violation.toFixed(1)} dB Above CPCB Limit</span>
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Decibel Display & Waveform Simulation */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Estimated Sound Pressure
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              A-Weighted dB(A)
            </span>
          </div>

          <div className="my-5 flex items-baseline space-x-3">
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              {currentDb}
            </span>
            <span className="text-lg font-bold text-cyan-400">dB(A)</span>
          </div>

          {/* Animated Acoustic Waveform Simulator */}
          <div className="space-y-2">
            <div className="flex items-end justify-between h-12 gap-1 px-1">
              {[40, 65, 85, 45, 95, 70, 80, 60, 90, 75, 88, 55, 68, 92, 74, 62, 85, 50, 78, 88].map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-t transition-all duration-300 bg-gradient-to-t from-cyan-600 to-teal-400"
                  style={{
                    height: `${Math.min(Math.max((h * (currentDb / 80)), 15), 100)}%`,
                    opacity: 0.7 + (i % 3) * 0.15,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>63 Hz (Low Rumble)</span>
              <span>1 kHz (Speech/Horns)</span>
              <span>8 kHz (Screech)</span>
            </div>
          </div>
        </div>

        {/* Breakdown of Acoustic Parameters */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Peak Decibel Level</span>
              </div>
              <p className="text-2xl font-black text-white">{peakDb.toFixed(1)} dB(A)</p>
              <p className="text-[11px] text-slate-400 mt-1">Recorded during peak traffic rush</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                <Car className="w-4 h-4 text-amber-400" />
                <span>Primary Sound Source</span>
              </div>
              <p className="text-base font-black text-white truncate">{source}</p>
              <p className="text-[11px] text-teal-400 mt-1">AI Confidence: {hotspot ? hotspot.aiConfidence : 96.8}%</p>
            </div>
          </div>

          {/* AI CORTN Engine Insight */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                <Waves className="w-4 h-4 text-teal-400" />
                <span>CORTN (Calculation of Road Traffic Noise) Estimation</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">TomTom Traffic Fusion</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesized in real-time from average vehicular speeds ({hotspot ? hotspot.trafficSpeedKmph : 18} km/h), vehicle density distribution, and road gradient geometry. Eliminates the high expense of physical IoT microphone hardware.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
