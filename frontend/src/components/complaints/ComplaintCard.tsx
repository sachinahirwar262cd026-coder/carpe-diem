import React from 'react';
import { CitizenComplaint } from '../../types';
import {
  Wind,
  Volume2,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

interface ComplaintCardProps {
  complaint: CitizenComplaint;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  const getDomainBadge = () => {
    switch (complaint.type) {
      case 'air':
        return {
          icon: Wind,
          label: 'Air Quality',
          style: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        };
      case 'noise':
        return {
          icon: Volume2,
          label: 'Noise Pollution',
          style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      default:
        return {
          icon: Sparkles,
          label: 'Combined Stress',
          style: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
    }
  };

  const getStatusBadge = () => {
    switch (complaint.status) {
      case 'Resolved':
        return {
          icon: CheckCircle2,
          style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'Action Dispatched':
        return {
          icon: FileCheck,
          style: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        };
      case 'Verified Hotspot':
        return {
          icon: AlertTriangle,
          style: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      default:
        return {
          icon: Clock,
          style: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
    }
  };

  const domain = getDomainBadge();
  const status = getStatusBadge();
  const DomainIcon = domain.icon;
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 shadow-lg backdrop-blur-sm hover:border-slate-700 transition">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${domain.style}`}>
            <DomainIcon className="w-3 h-3" />
            <span>{domain.label}</span>
          </span>
          <span className="font-mono text-xs text-slate-400 font-bold">
            {complaint.trackingNumber}
          </span>
        </div>

        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${status.style}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{complaint.status}</span>
        </span>
      </div>

      {/* Title and Description */}
      <div className="mt-3">
        <h4 className="text-sm font-black text-white">{complaint.title}</h4>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">{complaint.description}</p>
      </div>

      {/* AI Verification Breakdown Card */}
      <div className="mt-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-teal-300 font-bold">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Automated Inference:</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            {complaint.aiVerification.confidence}% Confidence
          </span>
        </div>

        <div className="flex justify-between text-slate-300">
          <span className="text-slate-400">Intensity:</span>
          <span className="font-mono font-bold text-cyan-300">{complaint.aiVerification.estimatedIntensity}</span>
        </div>

        <div className="flex justify-between text-slate-300">
          <span className="text-slate-400">Classification:</span>
          <span className="text-slate-200">{complaint.aiVerification.detectedSource}</span>
        </div>
      </div>

      {/* Action Taken (if available) */}
      {complaint.actionTaken && (
        <div className="mt-3 p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs">
          <span className="font-bold text-teal-300">Municipal Action: </span>
          <span className="text-slate-300">{complaint.actionTaken}</span>
        </div>
      )}

      {/* Footer Details */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span>{complaint.locationName}</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Credibility: <strong className="text-emerald-300">{complaint.citizenCredibility}/100</strong></span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{complaint.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
