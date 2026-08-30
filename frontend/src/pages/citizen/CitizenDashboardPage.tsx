import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Wind,
  Volume2,
  Camera,
  Mic,
  FileWarning,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HeartPulse,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/common/StatCard';
import { AqiHeroCard } from '../../components/aqi/AqiHeroCard';
import { NoiseHeroCard } from '../../components/noise/NoiseHeroCard';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { getAqiBadgeStyle, getAqiCategory, getNoiseBadgeStyle } from '../../utils/helpers';

export const CitizenDashboardPage: React.FC = () => {
  const { selectedCity, selectedPocket, complaints } = useApp();
  const { user } = useAuth();

  const aqiBadge = getAqiBadgeStyle(getAqiCategory(selectedCity.currentAqi));
  const noiseBadge = getNoiseBadgeStyle(selectedCity.currentNoise);

  const myComplaints = complaints.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10 border border-teal-500/20 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                Citizen Environmental Portal
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Smart India Hackathon 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Welcome back, {user?.name || 'Citizen Inspector'}!
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
              Monitor your local neighborhood air & noise quality, submit verified evidence to municipal squads, and track complaint resolution in real time.
            </p>
          </div>

          {/* Citizen Credibility Pill */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3 shrink-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust Score</span>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {user?.citizenCredibility || 94} / 100
              </p>
              <span className="text-[10px] text-slate-500 font-semibold">Verified Reporter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Evidence Submission Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Air Pollution Evidence */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                AI Vision
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
              Report Air Pollution Photo
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload photos of visible smoke plumes, industrial chimney emissions, dust clouds, or illegal garbage fires for instant AI severity analysis.
            </p>
          </div>

          <Link
            to="/citizen/air-evidence"
            className="mt-6 w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition text-center flex items-center justify-center space-x-2 shadow-md shadow-teal-500/15"
          >
            <span>Upload Air Evidence</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Noise Pollution Evidence */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20">
                <Mic className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                Min. 10s Audio
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
              Record Noise Audio Evidence
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sample at least 10 seconds of continuous audio. AI computes sound decibels and classifies pressure horns, jackhammers, and loudspeakers.
            </p>
          </div>

          <Link
            to="/citizen/noise-evidence"
            className="mt-6 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition text-center flex items-center justify-center space-x-2 shadow-md shadow-cyan-500/15"
          >
            <span>Record Noise Evidence (≥10s)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Live Environmental Telemetry Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <AqiHeroCard city={selectedCity} pocket={selectedPocket} />
        </div>
        <div className="lg:col-span-6">
          <NoiseHeroCard city={selectedCity} />
        </div>
      </div>

      {/* Citizen's Submitted Complaints & Live Status Feed */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm dark:shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              My Submissions & Enforcement Status
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              Tracked Citizen Incidents
            </h3>
          </div>

          <Link
            to="/complaints"
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
          >
            <span>View All ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myComplaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      </div>
    </div>
  );
};
