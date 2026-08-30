import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileWarning, ShieldCheck, CheckCircle2, Sparkles, Filter, Search } from 'lucide-react';
import { ComplaintForm } from '../components/complaints/ComplaintForm';
import { ComplaintCard } from '../components/complaints/ComplaintCard';
import { ComplaintSuccessModal } from '../components/complaints/ComplaintSuccessModal';
import { CitizenComplaint } from '../types';

export const SubmitComplaintPage: React.FC = () => {
  const { complaints } = useApp();
  const [submittedComplaint, setSubmittedComplaint] = useState<CitizenComplaint | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSuccess = (newComplaint: CitizenComplaint) => {
    setSubmittedComplaint(newComplaint);
    setIsSuccessModalOpen(true);
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType && filterType !== 'both') return false;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <FileWarning className="w-4 h-4" />
            <span>Citizen Crowdsourced Environmental Enforcement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Report Pollution Incident & Provide Evidence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit audio recordings, geotagged photos, and location data. AI instantly validates acoustic frequencies & smoke plumes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Reputation Credibility Engine Active</span>
          </span>
        </div>
      </div>

      {/* Main Submission Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800/80 mb-6">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Incident Submission Form</h3>
              <p className="text-xs text-slate-400">Direct integration with CPCB & Municipal Police Enforcement Queue</p>
            </div>
          </div>

          <ComplaintForm onSuccess={handleSuccess} />
        </div>

        {/* Side Panel: Credibility & AI Instructions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Citizen Credibility Badge */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reporter Status</span>
                <h4 className="text-base font-black text-white">Verified Citizen</h4>
                <p className="text-xs text-emerald-400 font-mono font-bold">Credibility: 94 / 100</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Every verified complaint verified by AI audio/photo evidence boosts your citizen trust tier, prioritizing your reports on authority patrol dashboards.
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Verified Reports:</span>
                <span className="font-bold text-white">12 Approved</span>
              </div>
              <div className="flex justify-between">
                <span>Average AI Match:</span>
                <span className="font-bold text-emerald-400 font-mono">96.8%</span>
              </div>
            </div>
          </div>

          {/* AI Evidence Guide */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-teal-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>How AI Evidence Verification Works</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>Audio Samples:</strong> Converted to 80-Mel spectrograms and classified via ResNet-18 for horn, drilling, or music signatures.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>Photo Uploads:</strong> Visual models detect particulate opacity, black carbon plumes, and unshielded DG generators.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>Micro-Location:</strong> Correlated with nearest CPCB sensor and traffic cameras for instant triangulation.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Citizen Complaint History Feed & Search */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white">Community Complaints & Dispatch Status</h3>
            <p className="text-xs text-slate-400">Browse verified incident reports across metropolitan corridors</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tracking ID or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center space-x-1.5">
              {(['all', 'air', 'noise'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                    filterType === filter
                      ? 'bg-teal-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComplaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      </div>

      {/* Success Modal */}
      <ComplaintSuccessModal
        complaint={submittedComplaint}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};
