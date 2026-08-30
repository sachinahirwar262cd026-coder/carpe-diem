import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Wind,
  Volume2,
  MapPin,
  FileWarning,
  Sparkles,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { StatCard } from "../components/common/StatCard";
import { AqiHeroCard } from "../components/aqi/AqiHeroCard";
import { Forecast24HourChart } from "../components/aqi/Forecast24HourChart";
import { PollutantGrid } from "../components/aqi/PollutantGrid";
import { InteractiveLeafletMap } from "../components/map/InteractiveLeafletMap";
import { AqiTrendAnalytics } from "../components/analytics/AqiTrendAnalytics";
import { NoiseTrendAnalytics } from "../components/analytics/NoiseTrendAnalytics";
import { PollutantRadarChart } from "../components/analytics/PollutantRadarChart";
import { ModelPerformanceCard } from "../components/analytics/ModelPerformanceCard";
import { Link } from "react-router-dom";
import {
  getAqiBadgeStyle,
  getAqiCategory,
  getNoiseBadgeStyle,
} from "../utils/helpers";
import {
  fetchForecast,
  ForecastResponse,
} from "../services/api/airQualityService";

export const DashboardPage: React.FC = () => {
  const { selectedCity, selectedPocket, complaints, noiseHotspots } = useApp();

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
  const aqiBadge = getAqiBadgeStyle(currentCategory as any);
  const noiseBadge = getNoiseBadgeStyle(selectedCity?.currentNoise ?? 0);

  const cityHotspotsCount =
    (selectedCity?.pockets?.filter((p) => p.isHotspot).length ?? 0) +
    noiseHotspots.filter((hotspot) => hotspot.status === "Active").length;
  const activeComplaintsCount = complaints.filter(
    (c) => c.status !== "Resolved",
  ).length;

  // Map API hourly records into chart format
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
      {/* Executive Page Header */}
      {forecastError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          Air quality service unavailable: {forecastError}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Integrated Environmental Surveillance &amp; AI Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {selectedCity.name} · Air &amp; Acoustic Command Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous ambient telemetry, Attention Bi-LSTM 24h forecasting,
            CORTN acoustic synthesis, and empirical model benchmarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/complaints"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition flex items-center space-x-2"
          >
            <FileWarning className="w-4 h-4 text-amber-500" />
            <span>Submit Grievance</span>
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-xs transition shadow-xs flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Dossier</span>
          </Link>
        </div>
      </div>

      {/* Primary Key Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Air Quality Index"
          value={currentAqi}
          subtitle={`Dominant: ${liveForecast?.current?.prominent_pollutant_display || selectedCity.primaryPollutant}`}
          icon={Wind}
          iconColor="text-emerald-600 dark:text-teal-400"
          iconBg="bg-emerald-50 dark:bg-teal-500/10 border-emerald-200 dark:border-teal-500/20"
          badgeText={currentCategory}
          badgeColor={`${aqiBadge.bg} ${aqiBadge.text} ${aqiBadge.border}`}
          trend={{
            value: "Live CPCB",
            isPositive: currentAqi <= 100,
            label: "NAQI Standard",
          }}
        />

        {/* <StatCard
          title="Street Noise Level"
          value={`${selectedCity.currentNoise} dB`}
          subtitle="CORTN Virtual Sensor Network"
          icon={Volume2}
          iconColor="text-blue-600 dark:text-cyan-400"
          iconBg="bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-500/20"
          badgeText={noiseBadge.label.split(' ')[0]}
          badgeColor={`${noiseBadge.bg} ${noiseBadge.text} ${noiseBadge.border}`}
          trend={{ value: 'Peak Rush', isPositive: false, label: 'Decibel Variance' }}
        /> */}

        <StatCard
          title="Active Hotspot Zones"
          value={cityHotspotsCount}
          subtitle="DBSCAN Clustered Corridors"
          icon={MapPin}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
          badgeText={`${cityHotspotsCount} Zones`}
          badgeColor="bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
          trend={{
            value: "Monitored",
            isPositive: true,
            label: "Spatial Clustering",
          }}
        />

        <StatCard
          title="Noise Grievances"
          value={activeComplaintsCount}
          subtitle="Citizen Verified Reports"
          icon={FileWarning}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20"
          badgeText={`${complaints.length} Total`}
          badgeColor="bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30"
          trend={{
            value: "Real Audio",
            isPositive: true,
            label: "10s Spectrogram",
          }}
        />
      </div>

      {/* Main AQI Hero & 24h Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AqiHeroCard
            city={selectedCity}
            pocket={selectedPocket}
            liveAqi={currentAqi}
            liveCategory={currentCategory}
            prominentPollutant={
              liveForecast?.current?.prominent_pollutant_display
            }
          />
        </div>
        <div className="lg:col-span-7">
          <Forecast24HourChart data={formattedHourlyForecast} />
        </div>
      </div>

      {/* Pollutant Composition Grid */}
      <PollutantGrid
        liveConcentrations={liveForecast?.current?.concentrations}
      />
    </div>
  );
};
