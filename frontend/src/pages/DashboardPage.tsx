import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wind,
  Volume2,
  MapPin,
  FileWarning,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  HeartPulse,
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

export const DashboardPage: React.FC = () => {
  const {
    selectedCity,
    selectedPocket,
    complaints,
    noiseHotspots,
    activeAlertCount,
    dismissAlert,
    dismissedAlerts,
  } = useApp();

  const aqiBadge = getAqiBadgeStyle(getAqiCategory(selectedCity.currentAqi));
  const noiseBadge = getNoiseBadgeStyle(selectedCity.currentNoise);

  const cityHotspotsCount = selectedCity.pockets.filter((p) => p.isHotspot).length;
  const recentComplaints = complaints.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top Banner / SIH Hackathon Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-900/90 to-cyan-950/80 border border-teal-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                SMART INDIA HACKATHON 2026
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Team Carpe diem · NIT Surathkal
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
                <span>Active Telemetry Online</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Intelligent Air & Noise Pollution Monitoring and Prediction
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Addressing urban micro-pocket air pollution and street acoustic noise through multi-sensor data fusion, LSTM deep learning forecasts, CORTN traffic-to-noise models, and verified citizen crowdsourcing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/complaints"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-teal-500/25 flex items-center space-x-2 whitespace-nowrap"
            >
              <FileWarning className="w-4 h-4" />
              <span>Submit Complaint</span>
            </Link>
            <Link
              to="/reports"
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center space-x-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Authority Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Priority Health Alerts Banner */}
      {selectedCity.currentAqi > 200 && !dismissedAlerts.includes('asthma-alert') && (
        <AlertBanner
          id="asthma-alert"
          type="asthma"
          title={`Asthma Alert for ${selectedCity.name}: AQI ${selectedCity.currentAqi} (${selectedCity.category})`}
          message="Thermal inversion is trapping fine PM2.5 particulates in urban micro-pockets. High risk for 30M+ Indian asthma patients. Keep rescue inhalers ready and avoid strenuous outdoor exercise."
          actionText="View Medical Advisory"
          actionLink="/air-quality"
          onDismiss={dismissAlert}
        />
      )}

      {/* Primary Key Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Current AQI Level"
          value={selectedCity.currentAqi}
          subtitle={`Primary: ${selectedCity.primaryPollutant}`}
          icon={Wind}
          iconColor="text-teal-400"
          iconBg="bg-teal-500/10 border-teal-500/20"
          badgeText={selectedCity.category}
          badgeColor={`${aqiBadge.bg} ${aqiBadge.text} ${aqiBadge.border}`}
          trend={{ value: '+14%', isPositive: true, label: 'vs morning baseline' }}
        />

        <StatCard
          title="Street Noise Index"
          value={`${selectedCity.currentNoise} dB`}
          subtitle="CORTN Traffic Virtual Sensor"
          icon={Volume2}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          badgeText={noiseBadge.label.split(' ')[0]}
          badgeColor={`${noiseBadge.bg} ${noiseBadge.text} ${noiseBadge.border}`}
          trend={{ value: '+8.2 dB', isPositive: true, label: 'during peak rush' }}
        />

        <StatCard
          title="Active Hotspot Zones"
          value={cityHotspotsCount}
          subtitle="Micro-pockets flagged by AI"
          icon={MapPin}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          badgeText="DBSCAN Clustered"
          badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
          trend={{ value: '3 Active', isPositive: false, label: 'in inspection queue' }}
        />

        <StatCard
          title="Citizen Complaints"
          value={complaints.length}
          subtitle="AI Verified with Evidence"
          icon={FileWarning}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/20"
          badgeText="94% Credibility"
          badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
          trend={{ value: '+4 new', isPositive: true, label: 'in last 2 hours' }}
        />
      </div>

      {/* Main AQI Hero & 24h Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <AqiHeroCard city={selectedCity} pocket={selectedPocket} />
        </div>
        <div className="lg:col-span-6">
          <Forecast24HourChart />
        </div>
      </div>

      {/* Pollutant Composition Grid */}
      <PollutantGrid />

      {/* Noise Monitoring Snapshot & Mini Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between">
          <NoiseHeroCard city={selectedCity} />
        </div>

        {/* Mini Interactive Map Preview Card */}
        <div className="lg:col-span-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                  Geospatial Surveillance
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                Live Hotspot & Evidence Map
              </h3>
            </div>

            <Link
              to="/hotspots"
              className="flex items-center space-x-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline"
            >
              <span>Full Screen Map</span>
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
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <FileWarning className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Citizen Participation Feed
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              Recent High-Confidence Citizen Evidence
            </h3>
          </div>

          <Link
            to="/complaints"
            className="flex items-center space-x-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline"
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
