import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Wind, MapPin, Sparkles } from "lucide-react";
import { AqiHeroCard } from "../components/aqi/AqiHeroCard";
import { PollutantGrid } from "../components/aqi/PollutantGrid";
import { Forecast24HourChart } from "../components/aqi/Forecast24HourChart";
import { AsthmaAdvisory } from "../components/aqi/AsthmaAdvisory";
import { MicroPocketTable } from "../components/aqi/MicroPocketTable";
import { getAqiBadgeStyle, getAqiCategory } from "../utils/helpers";
import {
  fetchForecast,
  ForecastResponse,
} from "../services/api/airQualityService";

export const AirQualityPage: React.FC = () => {
  const { selectedCity, selectedPocket, setSelectedPocket } = useApp();
  const [liveForecast, setLiveForecast] = useState<ForecastResponse | null>(
    null,
  );
  const [forecastError, setForecastError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setForecastError(null);
    fetchForecast(selectedCity.name)
      .then((res) => {
        if (isMounted) setLiveForecast(res);
      })
      .catch((error: Error) => {
        if (isMounted) setForecastError(error.message);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedCity.name]);

  const currentAqi =
    liveForecast?.current?.cpcb_aqi ??
    (selectedPocket?.aqi || selectedCity?.currentAqi || 0);
  const currentCategory = ((liveForecast?.current?.category as any) ??
    (selectedPocket?.aqi
      ? selectedPocket.category
      : getAqiCategory(currentAqi))) as any;
  const badgeStyle = getAqiBadgeStyle(currentCategory as any);

  const formattedHourlyForecast = (liveForecast?.hourly_forecast ?? []).map(
    (h, idx) => {
      const aqi = Number(h.cpcb_aqi ?? h.aqi ?? 0);
      return {
        time: h.label ?? `+${idx + 1}h`,
        hour: idx + 1,
        aqi,
        pm25: Number(h.pm2_5 ?? h.pm25 ?? 0),
        pm10: Number(h.pm10 ?? 0),
        confidenceLower: Math.max(10, Math.round(aqi * 0.88)),
        confidenceUpper: Math.round(aqi * 1.12),
        category: (h.category as any) ?? getAqiCategory(aqi),
        temp: 28,
        humidity: 55,
        windSpeed: 8,
      };
    },
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      {forecastError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          Air quality service unavailable: {forecastError}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <Wind className="w-4 h-4" />
            <span>Air Quality Surveillance &amp; Bi-LSTM Deep Forecasting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {selectedCity.name} · Atmospheric Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Micro-pocket telemetry combining CPCB continuous ambient stations
            with OpenWeather API spatial dispersion models.
          </p>
        </div>

        {/* Selected Micro-Pocket Pill */}
        {selectedPocket && (
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Inspecting Pocket
              </span>
              <p className="text-xs font-bold text-white">
                {selectedPocket.name}
              </p>
            </div>
            <span
              className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
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
          <Forecast24HourChart data={formattedHourlyForecast} />
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
