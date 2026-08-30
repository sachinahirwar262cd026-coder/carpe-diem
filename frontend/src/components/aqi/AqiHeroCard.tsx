import React from 'react';
import { Wind, Thermometer, Droplets, Compass, ShieldAlert, Cpu } from 'lucide-react';
import { GaugeChart } from '../common/GaugeChart';
import { getHealthAdvisory, getAqiBadgeStyle, getAqiCategory } from '../../utils/helpers';
import { CityData, MicroPocket } from '../../types';

interface AqiHeroCardProps {
  city: CityData;
  pocket?: MicroPocket | null;
}

export const AqiHeroCard: React.FC<AqiHeroCardProps> = ({ city, pocket }) => {
  const currentAqi = pocket ? pocket.aqi : city.currentAqi;
  const currentCategory = pocket ? pocket.category : city.category;
  const primaryPollutant = pocket ? pocket.dominantPollutant : city.primaryPollutant;
  const advisory = getHealthAdvisory(currentCategory);
  const badgeStyle = getAqiBadgeStyle(currentCategory);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Background glow behind gauge */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Live Air Quality Index
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">CPCB Data Fusion</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
            {pocket ? pocket.name : city.name}
          </h2>
          <p className="text-xs text-slate-400">
            {pocket ? `${pocket.zone} · ${city.name}` : `${city.state}, India`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Primary:</span>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30">
            {primaryPollutant}
          </span>
          <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {currentCategory}
          </span>
        </div>
      </div>

      {/* Main Content: Gauge + Health & Micro-climate metrics */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Interactive Radial Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-950/50 border border-slate-800/60">
          <GaugeChart value={currentAqi} max={500} label="National AQI Standard" />
          <div className="w-full mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-around text-xs text-slate-400">
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Model</p>
              <p className="font-semibold text-slate-300 font-mono">WVPBL-BiLSTM</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Accuracy</p>
              <p className="font-semibold text-emerald-400 font-mono">98.2%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Sampling</p>
              <p className="font-semibold text-slate-300 font-mono">Real-time</p>
            </div>
          </div>
        </div>

        {/* Right: Health Impact & Weather metrics */}
        <div className="lg:col-span-8 space-y-4">
          {/* Health Advisory Card */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-amber-400 mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-200">{advisory.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">{advisory.desc}</p>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs">
              <span className="font-bold text-rose-400">Asthma Warning: </span>
              <span className="text-rose-200/90">{advisory.asthmaWarning}</span>
            </div>
          </div>

          {/* Micro-Climate Meteorological Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                <span>Temp</span>
              </div>
              <p className="mt-1 text-base font-bold text-white">
                {pocket ? pocket.temperature : city.weather.temp}°C
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Humidity</span>
              </div>
              <p className="mt-1 text-base font-bold text-white">
                {pocket ? pocket.humidity : city.weather.humidity}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Wind Speed</span>
              </div>
              <p className="mt-1 text-base font-bold text-white">
                {pocket ? pocket.windSpeed : city.weather.windSpeed} km/h
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Direction</span>
              </div>
              <p className="mt-1 text-base font-bold text-white">
                {pocket ? pocket.windDirection : city.weather.windDirection}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
