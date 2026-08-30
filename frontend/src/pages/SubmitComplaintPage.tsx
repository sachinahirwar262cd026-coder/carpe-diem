import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileWarning, ShieldCheck, CheckCircle2, Sparkles, Filter, Search, Waves, Check } from 'lucide-react';
import { ComplaintForm } from '../components/complaints/ComplaintForm';
import { ComplaintCard } from '../components/complaints/ComplaintCard';
import { ComplaintSuccessModal } from '../components/complaints/ComplaintSuccessModal';
import { CitizenComplaint } from '../types';

export const SubmitComplaintPage: React.FC = () => {
  const { complaints, resolveComplaint } = useApp();
  const [submittedComplaint, setSubmittedComplaint] = useState<CitizenComplaint | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSuccess = (newComplaint: CitizenComplaint) => {
    setSubmittedComplaint(newComplaint);
    setIsSuccessModalOpen(true);
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'active' && c.status === 'Resolved') return false;
    if (filterStatus === 'resolved' && c.status !== 'Resolved') return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.locationName.toLowerCase().includes(q) ||
        c.trackingNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            <Waves className="w-4 h-4" />
            <span>Citizen Acoustic Noise Surveillance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Citizen Noise Grievance &amp; Spectrogram Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Record 10s audio evidence with instant Mel-Spectrogram generation, track submitted complaints, and mark issues as resolved.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 flex items-center space-x-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Citizen Trust: 94/100</span>
          </span>
        </div>
      </div>

      {/* Main Submission Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">File Noise Violation Incident</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">10-second microphone recording auto-cut with Mel-Spectrogram classification</p>
            </div>
          </div>

          <ComplaintForm onSuccess={handleSuccess} />
        </div>

        {/* Side Panel: Credibility & AI Instructions */}
        <div className="lg:col-span-4 space-y-4">
          {/* Citizen Credibility Badge */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Citizen Profile</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lokesh Satiwada</h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">Credibility Tier: Verified</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every verified 10-second audio recording converts to frequency bins and validates acoustic levels, prioritizing high-decibel violations on municipal patrol dashboards.
            </p>

            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Active Grievances:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeCount} Pending</span>
              </div>
              <div className="flex justify-between">
                <span>Resolved Issues:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount} Closed</span>
              </div>
            </div>
          </div>

          {/* AI Evidence Guide */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>10s Spectrogram Triage System</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>10s Auto-Cutoff:</strong> Audio records for max 10 seconds to capture representative acoustic signatures.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Mel-Spectrogram:</strong> Analyzed via 256-bin FFT to isolate commercial horns (1.2–2.4 kHz) from ambient baseline noise.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Citizen Resolution:</strong> Once the noise problem ceases or is mitigated, citizens can mark the grievance as resolved.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Citizen Complaint History Feed, Filters & Search */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              My Grievance History &amp; Status ({complaints.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review your past submitted noise complaints or mark them as resolved</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tracking ID or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter buttons */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({complaints.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'active'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'resolved'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Grid */}
        {filteredComplaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComplaints.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                onResolve={resolveComplaint}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No complaints found matching current filters.
          </div>
        )}
      </div>

      {/* Success Modal */}
      <ComplaintSuccessModal
        complaint={submittedComplaint}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};
