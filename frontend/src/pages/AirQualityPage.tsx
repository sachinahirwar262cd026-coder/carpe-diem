import React from 'react';
import { useApp } from '../context/AppContext';
import { Wind, MapPin, AlertTriangle, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { AqiHeroCard } from '../components/aqi/AqiHeroCard';
import { PollutantGrid } from '../components/aqi/PollutantGrid';
import { Forecast24HourChart } from '../components/aqi/Forecast24HourChart';
import { AsthmaAdvisory } from '../components/aqi/AsthmaAdvisory';
import { MicroPocketTable } from '../components/aqi/MicroPocketTable';
import { getAqiBadgeStyle, getAqiCategory } from '../utils/helpers';

export const AirQualityPage: React.FC = () => {
  const { selectedCity, selectedPocket, setSelectedPocket } = useApp();
  const currentCategory = selectedPocket ? selectedPocket.category : selectedCity.category;
  const currentAqi = selectedPocket ? selectedPocket.aqi : selectedCity.currentAqi;
  const badgeStyle = getAqiBadgeStyle(currentCategory);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <Wind className="w-4 h-4" />
            <span>Air Quality Surveillance & LSTM Forecasting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {selectedCity.name} · Air Pollution Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Micro-climate telemetry combining CPCB continuous ambient air stations with OpenWeather API spatial dispersion models.
          </p>
        </div>

        {/* Selected Micro-Pocket Pill */}
        {selectedPocket && (
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inspecting Pocket</span>
              <p className="text-xs font-bold text-white">{selectedPocket.name}</p>
            </div>
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
              AQI {selectedPocket.aqi}
            </span>
          </div>
        )}
      </div>

      {/* Main AQI Hero & 24h Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AqiHeroCard city={selectedCity} pocket={selectedPocket} />
        </div>
        <div className="lg:col-span-7">
          <Forecast24HourChart />
        </div>
      </div>

      {/* 6 Key Pollutants Grid */}
      <PollutantGrid />

      {/* Targeted Health Advisories (Asthma Patients focus) */}
      <AsthmaAdvisory aqi={currentAqi} category={currentCategory} />

      {/* Micro-Pocket Resolution Table */}
      <MicroPocketTable
        pockets={selectedCity.pockets}
        selectedPocket={selectedPocket}
        onSelectPocket={(pocket) => setSelectedPocket(pocket)}
      />
    </div>
  );
};
