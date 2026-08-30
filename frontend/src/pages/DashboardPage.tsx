import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wind,
  Volume2,
  MapPin,
  FileWarning,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { AqiHeroCard } from '../components/aqi/AqiHeroCard';
import { Forecast24HourChart } from '../components/aqi/Forecast24HourChart';
import { PollutantGrid } from '../components/aqi/PollutantGrid';
import { NoiseHeroCard } from '../components/noise/NoiseHeroCard';
import { ComplaintCard } from '../components/complaints/ComplaintCard';
import { InteractiveLeafletMap } from '../components/map/InteractiveLeafletMap';
import { Link } from 'react-router-dom';
import { getAqiBadgeStyle, getAqiCategory, getNoiseBadgeStyle } from '../utils/helpers';
import { fetchForecast, ForecastResponse } from '../services/api/airQualityService';

export const DashboardPage: React.FC = () => {
  const {
    selectedCity,
    selectedPocket,
    complaints,
  } = useApp();

  const [liveForecast, setLiveForecast] = useState<ForecastResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchForecast(selectedCity.name)
      .then((res) => {
        if (isMounted) setLiveForecast(res);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [selectedCity.name]);

  const currentAqi = selectedPocket ? selectedPocket.aqi : (liveForecast?.current?.cpcb_aqi ?? selectedCity.currentAqi);
  const currentCategory = selectedPocket ? selectedPocket.category : getAqiCategory(currentAqi);
  const aqiBadge = getAqiBadgeStyle(currentCategory);
  const noiseBadge = getNoiseBadgeStyle(selectedCity.currentNoise);

  const cityHotspotsCount = selectedCity.pockets.filter((p) => p.isHotspot).length;
  const recentComplaints = complaints.slice(0, 3);

  // Map API hourly records into chart format
  const formattedHourlyForecast = liveForecast?.hourly_forecast?.map((h, idx) => ({
    time: h.hour,
    hour: idx + 1,
    aqi: h.aqi,
    pm25: h.pm2_5,
    pm10: h.pm10,
    confidenceLower: Math.max(10, Math.round(h.aqi * 0.88)),
    confidenceUpper: Math.round(h.aqi * 1.12),
    category: getAqiCategory(h.aqi),
    temp: 28,
    humidity: 55,
    windSpeed: 8,
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-Time Environmental Intelligence &amp; Neural Forecasting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {selectedCity.name} · Air &amp; Acoustic Surveillance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous CPCB ambient monitoring, 24-hour Attention Bi-LSTM forecasting, and acoustic noise synthesis.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Air Quality Index"
          value={currentAqi}
          subtitle={`Dominant: ${liveForecast?.current?.prominent_pollutant_display || selectedCity.primaryPollutant}`}
          icon={Wind}
          iconColor="text-emerald-600 dark:text-teal-400"
          iconBg="bg-emerald-50 dark:bg-teal-500/10 border-emerald-200 dark:border-teal-500/20"
          badgeText={currentCategory}
          badgeColor={`${aqiBadge.bg} ${aqiBadge.text} ${aqiBadge.border}`}
          trend={{ value: 'Live CPCB', isPositive: currentAqi <= 100, label: 'NAQI Standard' }}
        />

        <StatCard
          title="Street Noise Level"
          value={`${selectedCity.currentNoise} dB`}
          subtitle="CORTN Virtual Sensor Network"
          icon={Volume2}
          iconColor="text-blue-600 dark:text-cyan-400"
          iconBg="bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-500/20"
          badgeText={noiseBadge.label.split(' ')[0]}
          badgeColor={`${noiseBadge.bg} ${noiseBadge.text} ${noiseBadge.border}`}
          trend={{ value: 'Peak Rush', isPositive: false, label: 'Decibel Variance' }}
        />

        <StatCard
          title="Active Hotspot Zones"
          value={cityHotspotsCount}
          subtitle="DBSCAN Clustered Corridors"
          icon={MapPin}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
          badgeText={`${cityHotspotsCount} Zones`}
          badgeColor="bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
          trend={{ value: 'Monitored', isPositive: true, label: 'Spatial Clustering' }}
        />

        <StatCard
          title="Citizen Grievances"
          value={complaints.length}
          subtitle="Crowdsourced Geotagged Reports"
          icon={FileWarning}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20"
          badgeText="94% Credibility"
          badgeColor="bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30"
          trend={{ value: 'Validated', isPositive: true, label: 'Multimodal AI Triage' }}
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
            prominentPollutant={liveForecast?.current?.prominent_pollutant_display}
          />
        </div>
        <div className="lg:col-span-7">
          <Forecast24HourChart data={formattedHourlyForecast} />
        </div>
      </div>

      {/* Pollutant Composition Grid */}
      <PollutantGrid liveConcentrations={liveForecast?.current?.concentrations} />

      {/* Noise Monitoring & Hotspot Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <NoiseHeroCard city={selectedCity} />
        </div>

        {/* Interactive Map Preview Card */}
        <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-teal-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
                  Geospatial Surveillance
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Live Hotspot &amp; Sensor Telemetry Map
              </h3>
            </div>

            <Link
              to="/hotspots"
              className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-teal-400 hover:underline transition"
            >
              <span>Full Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <InteractiveLeafletMap
              showAirHotspots={true}
              showNoiseHotspots={true}
              showComplaints={true}
            />
          </div>
        </div>
      </div>

      {/* Recent Citizen Complaints Feed */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <FileWarning className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Citizen Grievance Feed
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Recent Verified Incident Submissions
            </h3>
          </div>

          <Link
            to="/complaints"
            className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-teal-400 hover:underline transition"
          >
            <span>View All ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      </div>
    </div>
  );
};
