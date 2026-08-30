import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, Sliders, Waves, Radio, FileWarning, Filter, CheckCircle2 } from 'lucide-react';
import { NoiseHeroCard } from '../components/noise/NoiseHeroCard';
import { TrafficNoiseEstimator } from '../components/noise/TrafficNoiseEstimator';
import { SpectrogramViewer } from '../components/noise/SpectrogramViewer';
import { NoiseStandardsGuide } from '../components/noise/NoiseStandardsGuide';
import { ComplaintCard } from '../components/complaints/ComplaintCard';
import { NoiseHotspot } from '../types';

export const NoiseMonitoringPage: React.FC = () => {
  const { selectedCity, noiseHotspots, complaints } = useApp();
  const [selectedHotspot, setSelectedHotspot] = useState<NoiseHotspot | null>(null);

  const cityNoiseHotspots = noiseHotspots.filter(
    (h) => h.city.toLowerCase() === selectedCity.name.toLowerCase() || h.city.includes(selectedCity.name.split(' ')[0])
  );

  const noiseComplaints = complaints.filter(
    (c) => c.type === 'noise' || c.type === 'both'
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Volume2 className="w-4 h-4" />
            <span>Acoustic Surveillance & CORTN Virtual Sensing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {selectedCity.name} · Noise Pollution Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time decibel estimation through traffic kinematic models and citizen audio Mel-spectrogram AI analysis.
          </p>
        </div>

        {/* Hotspot count badge */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            {cityNoiseHotspots.length} Active Hotspots in {selectedCity.name}
          </span>
        </div>
      </div>

      {/* Main Noise Hero */}
      <NoiseHeroCard city={selectedCity} hotspot={selectedHotspot} />

      {/* Interactive CORTN Physics Simulator */}
      <TrafficNoiseEstimator />

      {/* Spectrogram & CNN Audio Classification Engine */}
      <SpectrogramViewer />

      {/* Hotspots Breakdown Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Acoustic Hotspot Registry
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              Identified High-Decibel Problem Corridors
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cityNoiseHotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              onClick={() => setSelectedHotspot(hotspot)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                selectedHotspot?.id === hotspot.id
                  ? 'bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{hotspot.name}</h4>
                    <p className="text-[11px] text-slate-400">{hotspot.zoneType} Zone · Limit {hotspot.standardLimit} dB</p>
                  </div>
                  <span className="text-lg font-black text-cyan-400 font-mono">
                    {hotspot.currentDb} dB(A)
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Primary Source</span>
                    <p className="font-semibold text-slate-200 mt-0.5 truncate">{hotspot.primarySource}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Peak Recorded</span>
                    <p className="font-bold text-rose-400 font-mono mt-0.5">{hotspot.peakDb} dB(A)</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Traffic Speed: {hotspot.trafficSpeedKmph} km/h</span>
                <span className="text-teal-400 font-bold font-mono">AI Conf: {hotspot.aiConfidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CPCB Noise Standards Guide */}
      <NoiseStandardsGuide />

      {/* Citizen Audio Evidence Feed */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <FileWarning className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Acoustic Crowdsourced Complaints
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              Verified Noise Evidence Submissions
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {noiseComplaints.map((cmp) => (
            <ComplaintCard key={cmp.id} complaint={cmp} />
          ))}
        </div>
      </div>
    </div>
  );
};
