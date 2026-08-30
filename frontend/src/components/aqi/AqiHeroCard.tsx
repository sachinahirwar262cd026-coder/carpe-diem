import React from 'react';
import { Wind, Thermometer, Droplets, Compass, Activity, ShieldCheck } from 'lucide-react';
import { GaugeChart } from '../common/GaugeChart';
import { getAqiBadgeStyle, getAqiCategory } from '../../utils/helpers';
import { CityData, MicroPocket } from '../../types';

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
  const currentCategory = liveCategory ?? (pocket ? pocket.category : city.category);
  const primaryPollutant = prominentPollutant ?? (pocket ? pocket.dominantPollutant : city.primaryPollutant);
  const badgeStyle = getAqiBadgeStyle(getAqiCategory(currentAqi));

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
              Live Air Quality Index
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">CPCB NAQI Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {pocket ? pocket.name : city.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {pocket ? `${pocket.zone} · ${city.name}` : `${city.state}, India`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 dark:text-slate-500 font-normal">Dominant:</span>
            <span className="text-emerald-700 dark:text-teal-300 font-bold">{primaryPollutant}</span>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {currentCategory}
          </span>
        </div>
      </div>

      {/* Main Content: Radial Gauge + Micro-climate Metrics */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Radial Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
          <GaugeChart value={currentAqi} max={500} label="Continuous Ambient AQI" />
          <div className="w-full mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around text-xs">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Algorithm</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">Bi-LSTM</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Confidence</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">98.2%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Status</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">Active</p>
            </div>
          </div>
        </div>

        {/* Right: Micro-Climate Meteorological Matrix */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 text-xs">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span>Temperature</span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {pocket ? pocket.temperature : city.weather.temp}°C
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 text-xs">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Humidity</span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {pocket ? pocket.humidity : city.weather.humidity}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 text-xs">
                <Wind className="w-3.5 h-3.5 text-emerald-500" />
                <span>Wind Speed</span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {pocket ? pocket.windSpeed : city.weather.windSpeed} km/h
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 text-xs">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>Wind Vector</span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {pocket ? pocket.windDirection : city.weather.windDirection}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Station Ingestion: </span>
            <span>Real-time atmospheric telemetry synchronized via OpenWeatherMap &amp; Open-Meteo fallback.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
