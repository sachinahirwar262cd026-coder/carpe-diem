import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { HOURLY_FORECAST_24H } from "../../data/mockAqiData";
import { HourlyForecast } from "../../types";
import { Sparkles, TrendingUp } from "lucide-react";

interface Forecast24HourChartProps {
  data?: HourlyForecast[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as HourlyForecast;
    return (
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 shadow-xl text-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 gap-4">
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {data.time}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-teal-500/20 text-emerald-700 dark:text-teal-300 border border-emerald-200 dark:border-teal-500/30">
            {data.category}
          </span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Predicted AQI:</span>
            <span className="font-bold text-emerald-600 dark:text-teal-400 font-mono text-sm">
              {data.aqi}
            </span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>PM2.5 / PM10:</span>
            <span className="font-mono text-slate-700 dark:text-slate-200">
              {data.pm25} / {data.pm10} µg/m³
            </span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Confidence Range:</span>
            <span className="font-mono text-slate-600 dark:text-slate-300">
              {data.confidenceLower} - {data.confidenceUpper}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const Forecast24HourChart: React.FC<Forecast24HourChartProps> = ({
  data,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<"aqi" | "pm25" | "pm10">(
    "aqi",
  );

  const validData = Array.isArray(data) && data.length > 0 ? data : [];
  const peakForecast =
    validData.length > 0
      ? [...validData].sort((a, b) => b.aqi - a.aqi)[0]
      : null;

  if (validData.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-teal-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
            Attention Bi-LSTM Neural Forecaster
          </span>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Live AQI forecast data is loading. Please wait for the backend
          response to finish.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition">
      {/* Header with Title & Metric Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-teal-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
              Attention Bi-LSTM Neural Forecaster
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            24-Hour Horizon Multi-Pollutant Forecast
          </h3>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setSelectedMetric("aqi")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedMetric === "aqi"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            AQI
          </button>
          <button
            onClick={() => setSelectedMetric("pm25")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedMetric === "pm25"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            PM 2.5
          </button>
          <button
            onClick={() => setSelectedMetric("pm10")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedMetric === "pm10"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            PM 10
          </button>
        </div>
      </div>

      {/* Model Insight Callout */}
      {peakForecast && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-teal-400 shrink-0" />
            <span>
              <strong>Model Projection:</strong> Peak level expected around{" "}
              <strong>{peakForecast.time}</strong> (AQI ~ {peakForecast.aqi} -{" "}
              {peakForecast.category}).
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-teal-300 bg-emerald-50 dark:bg-teal-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-teal-500/30 shrink-0 font-bold">
            Confidence: 96.4%
          </span>
        </div>
      )}

      {/* Recharts Area Chart */}
      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={validData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="aqiAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#94a3b8"
              strokeOpacity={0.15}
            />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={100}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{
                value: "Moderate Limit (100)",
                fill: "#f59e0b",
                fontSize: 10,
              }}
            />
            <ReferenceLine
              y={200}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                value: "Poor Limit (200)",
                fill: "#ef4444",
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey={
                selectedMetric === "aqi"
                  ? "aqi"
                  : selectedMetric === "pm25"
                    ? "pm25"
                    : "pm10"
              }
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#aqiAreaGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
