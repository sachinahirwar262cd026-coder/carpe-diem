import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, X, ArrowRight, Copy } from 'lucide-react';
import { CitizenComplaint } from '../../types';
import { Link } from 'react-router-dom';

interface ComplaintSuccessModalProps {
  complaint: CitizenComplaint | null;
  onClose: () => void;
}

export const ComplaintSuccessModal: React.FC<ComplaintSuccessModalProps> = ({
  complaint,
  onClose,
}) => {
  if (!complaint) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(complaint.trackingNumber);
    alert(`Copied tracking ID: ${complaint.trackingNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Ambient background light */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4">
            <CheckCircle2 className="w-9 h-9 text-slate-950 stroke-[2.5]" />
          </div>

          <h3 className="text-2xl font-black text-white">Complaint Submitted!</h3>
          <p className="mt-1 text-xs text-slate-400">
            Smart India Hackathon 2026 · AI Citizen Verification Pipeline
          </p>
        </div>

        {/* Tracking Number Pill */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Official Tracking Reference ID
            </span>
            <p className="font-mono text-base font-extrabold text-teal-400">{complaint.trackingNumber}</p>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Copy ID"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Instant AI Verification Breakdown */}
        <div className="mt-4 p-4 rounded-2xl bg-teal-950/30 border border-teal-500/20 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-teal-300 font-bold">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>AI Automated Pre-Verification Passed</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Confidence Score:</span>
            <span className="font-mono font-bold text-emerald-400">{complaint.aiVerification.confidence}%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Classified Source:</span>
            <span className="font-medium text-slate-200">{complaint.aiVerification.detectedSource}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Citizen Credibility:</span>
            <span className="font-mono font-bold text-teal-300">94/100 (+2 pts awarded)</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mt-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Action Workflow
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              1. AI Verified ✓
            </div>
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold animate-pulse">
              2. Dispatched ⚡
            </div>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
              3. Resolution
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center space-x-3">
          <Link
            to="/hotspots"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition text-center flex items-center justify-center space-x-1.5"
          >
            <span>View on Hotspot Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
