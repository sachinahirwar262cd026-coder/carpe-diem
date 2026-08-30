import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, Sparkles, Cpu, Compass, Layers, Activity } from 'lucide-react';
import { AqiTrendAnalytics } from '../components/analytics/AqiTrendAnalytics';
import { NoiseTrendAnalytics } from '../components/analytics/NoiseTrendAnalytics';
import { PollutantRadarChart } from '../components/analytics/PollutantRadarChart';
import { ModelPerformanceCard } from '../components/analytics/ModelPerformanceCard';
import { Forecast24HourChart } from '../components/aqi/Forecast24HourChart';

export const AnalyticsPage: React.FC = () => {
  const { selectedCity } = useApp();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <BarChart3 className="w-4 h-4" />
            <span>Empirical Intelligence & Predictive Models</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {selectedCity.name} · Analytics & Model Performance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep-dive multi-parameter trends, spatial radar footprints, and validation metrics for Team Carpe diem's SIH AI models.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
            4 Core AI Models Deployed
          </span>
        </div>
      </div>

      {/* 24-Hour Predictive Horizon */}
      <Forecast24HourChart />

      {/* 7-Day Historical vs Predicted AQI Trend */}
      <AqiTrendAnalytics />

      {/* 2-Column: Noise Diurnal Correlation & Pollutant Radar Fingerprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <NoiseTrendAnalytics />
        </div>
        <div className="lg:col-span-6">
          <PollutantRadarChart />
        </div>
      </div>

      {/* Machine Learning Model Benchmark Metrics */}
      <ModelPerformanceCard />
    </div>
  );
};
