import React from "react";
import {
  Wind,
  Thermometer,
  Droplets,
  Compass,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { GaugeChart } from "../common/GaugeChart";
import { getAqiBadgeStyle, getAqiCategory } from "../../utils/helpers";
import { CityData, MicroPocket } from "../../types";

interface AqiHeroCardProps {
  city: CityData;
  pocket?: MicroPocket | null;
  liveAqi?: number;
  liveCategory?: string;
  prominentPollutant?: string;
}

export const AqiHeroCard: React.FC<AqiHeroCardProps> = ({
  city,
  pocket,
  liveAqi,
  liveCategory,
  prominentPollutant,
}) => {
  const currentAqi = liveAqi ?? (pocket ? pocket.aqi : city.currentAqi);
  const currentCategory =
    liveCategory ?? (pocket ? pocket.category : city.category);
  const primaryPollutant =
    prominentPollutant ??
    (pocket ? pocket.dominantPollutant : city.primaryPollutant);
  const badgeStyle = getAqiBadgeStyle(getAqiCategory(currentAqi));

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
              Live Air Quality Index
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              CPCB NAQI Standard
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {pocket ? pocket.name : city.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {pocket ? `${pocket.zone} · ${city.name}` : `${city.state}, India`}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
          <GaugeChart
            value={currentAqi}
            max={500}
            label="Continuous Ambient AQI"
          />
          <div className="w-full mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center rounded-lg bg-white/70 dark:bg-slate-900/60 p-2">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                AQI
              </p>
              <p className="mt-1 font-black text-slate-900 dark:text-white font-mono text-sm">
                {currentAqi}
              </p>
            </div>
            <div className="text-center rounded-lg bg-white/70 dark:bg-slate-900/60 p-2">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Category
              </p>
              <p className="mt-1 font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                {currentCategory}
              </p>
            </div>
            <div className="text-center rounded-lg bg-white/70 dark:bg-slate-900/60 p-2">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Pollutant
              </p>
              <p className="mt-1 font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                {primaryPollutant}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
