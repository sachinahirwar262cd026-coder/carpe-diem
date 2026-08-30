import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { HOURLY_FORECAST_24H } from '../../data/mockAqiData';
import { HourlyForecast } from '../../types';
import { Sparkles, Info, TrendingUp, AlertTriangle } from 'lucide-react';

interface Forecast24HourChartProps {
  data?: HourlyForecast[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as HourlyForecast;
    return (
      <div className="rounded-xl bg-slate-900/95 border border-slate-700 p-3 shadow-2xl backdrop-blur-md text-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 gap-4">
          <span className="font-bold text-white text-sm">{data.time}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            {data.category}
          </span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Predicted AQI:</span>
            <span className="font-extrabold text-teal-400 font-mono text-sm">{data.aqi}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>PM2.5 / PM10:</span>
            <span className="font-mono text-slate-200">{data.pm25} / {data.pm10} µg/m³</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Confidence Interval:</span>
            <span className="font-mono text-slate-300">{data.confidenceLower} - {data.confidenceUpper}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Temp / Wind:</span>
            <span className="font-mono text-slate-200">{data.temp}°C · {data.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const Forecast24HourChart: React.FC<Forecast24HourChartProps> = ({
  data = HOURLY_FORECAST_24H,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'aqi' | 'pm25' | 'pm10'>('aqi');

  const peakForecast = [...data].sort((a, b) => b.aqi - a.aqi)[0];

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      {/* Header with Title & Metric Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              AI-Powered Deep Learning Forecast
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            24-Hour Neighborhood AQI Prediction
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedMetric('aqi')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              selectedMetric === 'aqi'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            AQI Index
          </button>
          <button
            onClick={() => setSelectedMetric('pm25')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              selectedMetric === 'pm25'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            PM 2.5
          </button>
          <button
            onClick={() => setSelectedMetric('pm10')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              selectedMetric === 'pm10'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            PM 10
          </button>
        </div>
      </div>

      {/* Model Insight Callout */}
      <div className="mt-4 p-3 rounded-2xl bg-teal-950/30 border border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-teal-300">
          <TrendingUp className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong>LSTM Model Projection:</strong> Peak pollution surge projected around <strong>{peakForecast.time}</strong> (AQI ~ {peakForecast.aqi} - {peakForecast.category}).
          </span>
        </div>
        <span className="text-[11px] font-mono text-teal-400 bg-teal-900/40 px-2 py-0.5 rounded border border-teal-700/50">
          Confidence: 96.4%
        </span>
      </div>

      {/* Recharts Area Chart */}
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* National Threshold Reference Lines */}
            <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Moderate Limit (100)', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Severe Threshold (200)', fill: '#ef4444', fontSize: 10, position: 'right' }} />

            {/* Confidence Upper Bound */}
            <Area
              type="monotone"
              dataKey="confidenceUpper"
              stroke="#38bdf8"
              strokeDasharray="4 4"
              strokeWidth={1}
              fill="url(#confidenceGradient)"
              name="Confidence Range"
            />

            {/* Core Predictive Line */}
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke="#14b8a6"
              strokeWidth={3}
              fill="url(#aqiAreaGradient)"
              name="Predicted AQI"
              activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#042f2e', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Calculated hourly using OpenWeather temperature, wind vectors & CPCB ground telemetry.</span>
        </div>
        <span className="font-mono text-slate-500">24-Hour Horizon</span>
      </div>
    </div>
  );
};
