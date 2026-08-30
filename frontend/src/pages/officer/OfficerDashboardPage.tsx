import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  AlertTriangle,
  FileWarning,
  Wind,
  Volume2,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  Download,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  Printer,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { InteractiveLeafletMap } from '../../components/map/InteractiveLeafletMap';
import { Forecast24HourChart } from '../../components/aqi/Forecast24HourChart';
import { PrioritizedActionsTable } from '../../components/reports/PrioritizedActionsTable';
import { GovernmentReportModal } from '../../components/reports/GovernmentReportModal';
import { CURRENT_AI_REPORT } from '../../data/mockAiReports';
import { CitizenComplaint } from '../../types';

export const OfficerDashboardPage: React.FC = () => {
  const { selectedCity, noiseHotspots, complaints } = useApp();
  const { user } = useAuth();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<'all' | 'critical' | 'verified'>('all');
  const [actionNotices, setActionNotices] = useState<Record<string, string>>({});

  const airHotspotsCount = selectedCity.pockets.filter((p) => p.isHotspot).length;
  const noiseHotspotsCount = noiseHotspots.length;
  const totalHotspots = airHotspotsCount + noiseHotspotsCount;

  const filteredQueue = complaints.filter((c) => {
    if (selectedQueueFilter === 'critical') return c.aiVerification.urgencyLevel === 'Critical';
    if (selectedQueueFilter === 'verified') return c.status === 'Verified Hotspot';
    return true;
  });

  const handleQuickDispatch = (complaintId: string, actionType: string) => {
    setActionNotices((prev) => ({
      ...prev,
      [complaintId]: `Enforcement Action: ${actionType} dispatched to field unit at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Officer Command Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                OFFICER COMMAND CENTER
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                CPCB · SPCB · Municipal Police Grid
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {selectedCity.name} · Environmental Enforcement Dashboard
            </h1>
            <p className="mt-1.5 text-xs text-slate-300 max-w-3xl leading-relaxed">
              Monitoring Officer: <strong>{user?.name || 'Dr. Anjali Sharma'}</strong> ({user?.role || 'CPCB Officer / Analyst'}). Translating continuous LSTM particulate predictions and CORTN acoustic grids into immediate municipal actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-indigo-500/20 flex items-center space-x-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Generate Official Dossier (PDF/JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Officer Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Active Hotspot Pockets"
          value={totalHotspots}
          subtitle={`${airHotspotsCount} Air + ${noiseHotspotsCount} Noise Corridors`}
          icon={AlertTriangle}
          iconColor="text-rose-400"
          iconBg="bg-rose-500/10 border-rose-500/20"
          badgeText="Requires Patrol"
          badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/30"
          trend={{ value: '2 Critical', isPositive: true, label: 'exceeding thresholds' }}
        />

        <StatCard
          title="Citizen Reports Queue"
          value={complaints.length}
          subtitle="Awaiting Municipal Action"
          icon={FileWarning}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          badgeText="96.8% AI Verified"
          badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
          trend={{ value: '+4 Today', isPositive: true, label: 'geotagged with evidence' }}
        />

        <StatCard
          title="Mean Metropolitan AQI"
          value={selectedCity.currentAqi}
          subtitle={`Stressor: ${selectedCity.primaryPollutant}`}
          icon={Wind}
          iconColor="text-teal-400"
          iconBg="bg-teal-500/10 border-teal-500/20"
          badgeText={selectedCity.category}
          badgeColor="bg-teal-500/20 text-teal-300 border-teal-500/30"
          trend={{ value: '+18% 06-09am', isPositive: true, label: 'thermal inversion' }}
        />

        <StatCard
          title="Peak Acoustic Stress"
          value={`${selectedCity.currentNoise} dB`}
          subtitle="Commercial Flyover Bottlenecks"
          icon={Volume2}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          badgeText="Violation Zone"
          badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
          trend={{ value: '+21 dB over limit', isPositive: true }}
        />
      </div>

      {/* AI Executive Plain-Language Summary Callout */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>LLM Environmental Agent Actionable Briefing</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          {CURRENT_AI_REPORT.executiveSummary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {CURRENT_AI_REPORT.criticalHighlights.slice(0, 2).map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex items-start space-x-2 text-slate-700 dark:text-slate-300"
            >
              <span className="text-rose-500 font-bold mt-0.5">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 24-Hour Forecast & Hotspot Geospatial Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <Forecast24HourChart />
        </div>

        <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                Spatial Hotspot Cluster Grid
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Live Hotspots & Citizen Complaint Density
              </h3>
            </div>
          </div>

          <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <InteractiveLeafletMap
              showAirHotspots={true}
              showNoiseHotspots={true}
              showComplaints={true}
            />
          </div>
        </div>
      </div>

      {/* High-Priority Citizen Incident Triage Queue */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Authority Incident Triage
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              High-Priority Citizen Evidence Queue
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {(['all', 'critical', 'verified'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedQueueFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  selectedQueueFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {item.aiVerification.urgencyLevel}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {item.trackingNumber}
                  </span>
                  <span className="text-xs text-slate-400">· {item.locationName}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  {item.description}
                </p>

                <div className="flex items-center space-x-3 text-[11px] text-teal-600 dark:text-teal-400 font-medium pt-1">
                  <span>AI Detection: <strong>{item.aiVerification.detectedSource}</strong></span>
                  <span>•</span>
                  <span>Confidence: <strong>{item.aiVerification.confidence}%</strong></span>
                </div>

                {actionNotices[item.id] && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    {actionNotices[item.id]}
                  </div>
                )}
              </div>

              {/* Triage Action Buttons */}
              <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                <button
                  onClick={() =>
                    handleQuickDispatch(item.id, 'Mobile Anti-Smog Gun / Flying Squad')
                  }
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Field Unit</span>
                </button>

                <button
                  onClick={() =>
                    handleQuickDispatch(item.id, 'Statutory Notice & Automated E-Challan')
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center space-x-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Issue Statutory Notice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prioritized Authority Interventions Matrix */}
      <PrioritizedActionsTable />

      {/* Official Government Dossier Modal */}
      <GovernmentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
