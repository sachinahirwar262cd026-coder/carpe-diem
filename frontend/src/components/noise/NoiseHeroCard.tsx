import React from "react";
import { Volume2, TrendingUp } from "lucide-react";
import { CityData } from "../../types";
import { getNoiseBadgeStyle } from "../../utils/helpers";

interface NoiseHeroCardProps {
  city: CityData;
}

export const NoiseHeroCard: React.FC<NoiseHeroCardProps> = ({ city }) => {
  const badge = getNoiseBadgeStyle(city.currentNoise ?? 0);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Noise Monitoring
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {city.name}
            </h3>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Current Noise
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-600 dark:text-cyan-400">
            {city.currentNoise.toFixed(1)} dB
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Trend
          </p>
          <div className="mt-2 flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-lg font-black">Stable</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Acoustic sensors and CORTN estimates are being refreshed from the live
        backend, and this card updates once the gateway is available.
      </p>
    </div>
  );
};
