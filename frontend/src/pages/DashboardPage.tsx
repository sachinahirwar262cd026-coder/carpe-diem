import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wind,
  Volume2,
  MapPin,
  FileWarning,
  Sparkles,
  ArrowRight,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { AlertBanner } from '../components/common/AlertBanner';
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
    dismissAlert,
    dismissedAlerts,
  } = useApp();

  const [liveForecast, setLiveForecast] = useState<ForecastResponse | null>(null);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadLiveCityData = async () => {
      setLoadingForecast(true);
      try {
        const res = await fetchForecast(selectedCity.name);
        if (isMounted) {
          setLiveForecast(res);
        }
      } catch {
        // Fallback gracefully to default state
      } finally {
        if (isMounted) {
          setLoadingForecast(false);
        }
      }
    };

    loadLiveCityData();
    return () => {
      isMounted = false;
    };
  }, [selectedCity.name]);

  const currentAqi = liveForecast?.current?.cpcb_aqi ?? selectedCity.currentAqi;
  const currentCategory = liveForecast?.current?.category ?? selectedCity.category;
  const aqiBadge = getAqiBadgeStyle(getAqiCategory(currentAqi));
  const noiseBadge = getNoiseBadgeStyle(selectedCity.currentNoise);

  const cityHotspotsCount = selectedCity.pockets.filter((p) => p.isHotspot).length;
  const recentComplaints = complaints.slice(0, 3);

  // Map API hourly records into chart format if available
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-Time Environmental Surveillance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {selectedCity.name} · Urban Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            CPCB NAQI multi-sensor monitoring, Attention Bi-LSTM 24h forecasting, and citizen acoustic telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/complaints"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center space-x-2"
          >
            <FileWarning className="w-4 h-4 text-amber-400" />
            <span>Submit Grievance</span>
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-sm flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Dossier</span>
          </Link>
        </div>
      </div>

      {/* Priority Health Alerts Banner */}
      {currentAqi > 200 && !dismissedAlerts.includes('asthma-alert') && (
        <AlertBanner
          id="asthma-alert"
          type="asthma"
          title={`Asthma Alert for ${selectedCity.name}: AQI ${currentAqi} (${currentCategory})`}
          message="Thermal inversion is trapping fine particulates in urban corridors. Asthmatic and vulnerable individuals should minimize morning outdoor exposure."
          actionText="View Detailed Health Advisory"
          actionLink="/air-quality"
          onDismiss={dismissAlert}
        />
      )}

      {/* Primary Key Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Air Quality Index"
          value={currentAqi}
          subtitle={`Dominant: ${liveForecast?.current?.prominent_pollutant_display || selectedCity.primaryPollutant}`}
          icon={Wind}
          iconColor="text-teal-400"
          iconBg="bg-teal-500/10 border-teal-500/20"
          badgeText={currentCategory}
          badgeColor={`${aqiBadge.bg} ${aqiBadge.text} ${aqiBadge.border}`}
          trend={{ value: 'Live CPCB', isPositive: currentAqi <= 100, label: 'Official NAQI standard' }}
        />

        <StatCard
          title="Street Noise Level"
          value={`${selectedCity.currentNoise} dB`}
          subtitle="CORTN Virtual Sensor Network"
          icon={Volume2}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          badgeText={noiseBadge.label.split(' ')[0]}
          badgeColor={`${noiseBadge.bg} ${noiseBadge.text} ${noiseBadge.border}`}
          trend={{ value: 'Peak Rush', isPositive: false, label: 'High decibel variance' }}
        />

        <StatCard
          title="Active Hotspot Zones"
          value={cityHotspotsCount}
          subtitle="DBSCAN Clustered Micro-Pockets"
          icon={MapPin}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          badgeText={`${cityHotspotsCount} Pockets`}
          badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
          trend={{ value: 'Monitored', isPositive: true, label: 'Autonomous clustering' }}
        />

        <StatCard
          title="Citizen Grievances"
          value={complaints.length}
          subtitle="Crowdsourced Geotagged Reports"
          icon={FileWarning}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/20"
          badgeText="94% Credibility"
          badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
          trend={{ value: 'Validated', isPositive: true, label: 'AI multimodal triage' }}
        />
      </div>

      {/* Main AQI Hero & 24h Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <AqiHeroCard city={selectedCity} pocket={selectedPocket} />
        </div>
        <div className="lg:col-span-6">
          <Forecast24HourChart data={formattedHourlyForecast} />
        </div>
      </div>

      {/* Pollutant Composition Grid */}
      <PollutantGrid />

      {/* Noise Monitoring & Hotspot Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <NoiseHeroCard city={selectedCity} />
        </div>

        {/* Interactive Map Preview Card */}
        <div className="lg:col-span-6 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Geospatial Intelligence
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Live Hotspot &amp; Telemetry Map
              </h3>
            </div>

            <Link
              to="/hotspots"
              className="flex items-center space-x-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
            >
              <span>Full Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-800">
            <InteractiveLeafletMap
              showAirHotspots={true}
              showNoiseHotspots={true}
              showComplaints={true}
            />
          </div>
        </div>
      </div>

      {/* Recent Citizen Complaints Feed */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <FileWarning className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Citizen Grievance Feed
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Recent Verified Incident Reports
            </h3>
          </div>

          <Link
            to="/complaints"
            className="flex items-center space-x-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
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
