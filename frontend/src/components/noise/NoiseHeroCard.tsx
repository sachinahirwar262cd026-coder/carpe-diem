import React from 'react';
import { Volume2, Activity, Waves, ShieldCheck } from 'lucide-react';
import { GaugeChart } from '../common/GaugeChart';
import { getNoiseBadgeStyle } from '../../utils/helpers';
import { CityData, MicroPocket } from '../../types';

interface NoiseHeroCardProps {
  city: CityData;
  pocket?: MicroPocket | null;
  liveNoise?: number;
}

export const NoiseHeroCard: React.FC<NoiseHeroCardProps> = ({
  city,
  pocket,
  liveNoise,
}) => {
  const currentNoise = liveNoise ?? (pocket ? pocket.noiseDb : city.currentNoise);
  const badgeStyle = getNoiseBadgeStyle(currentNoise);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Live Acoustic Decibel Level
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">CPCB Noise Rules 2000</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {pocket ? pocket.name : city.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {pocket ? `${pocket.zone} · ${city.name}` : `${city.state}, India`}
          </p>
        </div>
      </div>

      {/* Main Content: Radial Gauge + Acoustic Metrics */}
      <div className="mt-5">
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
          <GaugeChart value={currentNoise} max={120} label="Continuous Noise dB(A)" />
          <div className="w-full mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around text-xs">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Method</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">CORTN + FFT</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Confidence</p>
              <p className="font-semibold text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">97.4%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Status</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">Active Telemetry</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
