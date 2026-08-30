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
  Camera,
  Mic,
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
          label: 'Air Pollution',
          style: 'bg-emerald-50 dark:bg-teal-500/20 text-emerald-700 dark:text-teal-300 border-emerald-200 dark:border-teal-500/40',
        };
      case 'noise':
        return {
          icon: Volume2,
          label: 'Noise Pollution',
          style: 'bg-blue-50 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-300 border-blue-200 dark:border-cyan-500/40',
        };
      default:
        return {
          icon: Sparkles,
          label: 'Combined Stress',
          style: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/40',
        };
    }
  };

  const getStatusBadge = () => {
    switch (complaint.status) {
      case 'Resolved':
        return {
          icon: CheckCircle2,
          style: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
        };
      case 'Action Dispatched':
        return {
          icon: FileCheck,
          style: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
        };
      case 'Verified Hotspot':
        return {
          icon: AlertTriangle,
          style: 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
        };
      default:
        return {
          icon: Clock,
          style: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
        };
    }
  };

  const domain = getDomainBadge();
  const status = getStatusBadge();
  const DomainIcon = domain.icon;
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        {/* Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${domain.style}`}>
              <DomainIcon className="w-3 h-3" />
              <span>{domain.label}</span>
            </span>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-bold">
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
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{complaint.title}</h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{complaint.description}</p>
        </div>

        {/* Attached Photo Thumbnail (if provided) */}
        {complaint.imageUrl && (
          <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-32 bg-slate-100 dark:bg-slate-950">
            <img
              src={complaint.imageUrl}
              alt="Attached Evidence"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-semibold flex items-center space-x-1">
              <Camera className="w-3 h-3" />
              <span>Photo Evidence</span>
            </span>
          </div>
        )}

        {/* AI Verification Breakdown Card */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-emerald-700 dark:text-teal-300 font-bold">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400" />
              <span>AI Automated Verification:</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {complaint.aiVerification?.confidence || 96.8}%
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Intensity:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-cyan-300">{complaint.aiVerification?.estimatedIntensity}</span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Classification:</span>
            <span className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{complaint.aiVerification?.detectedSource}</span>
          </div>

          {complaint.audioDurationSec && (
            <div className="flex items-center space-x-1.5 text-blue-600 dark:text-cyan-400 pt-1 text-[11px] font-medium">
              <Mic className="w-3.5 h-3.5" />
              <span>Audio Clip: {complaint.audioDurationSec}s Recorded</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-1.5 truncate max-w-[150px]">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400 shrink-0" />
          <span className="truncate">{complaint.locationName}</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Score: <strong className="text-slate-700 dark:text-emerald-300">{complaint.citizenCredibility}/100</strong></span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{complaint.timestamp.slice(0, 10)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
