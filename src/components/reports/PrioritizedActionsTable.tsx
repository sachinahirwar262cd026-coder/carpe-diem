import React, { useState } from 'react';
import { AiRecommendation } from '../../types';
import { CURRENT_AI_REPORT } from '../../data/mockAiReports';
import { ShieldCheck, Send, CheckCircle2, Clock, AlertTriangle, Filter } from 'lucide-react';

interface PrioritizedActionsTableProps {
  recommendations?: AiRecommendation[];
}

export const PrioritizedActionsTable: React.FC<PrioritizedActionsTableProps> = ({
  recommendations = CURRENT_AI_REPORT.recommendations,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDomain, setFilterDomain] = useState<string>('all');

  const filtered = recommendations.filter((r) => {
    if (filterPriority !== 'all' && r.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
    if (filterDomain !== 'all') {
      if (filterDomain === 'air' && r.targetType !== 'Air Quality') return false;
      if (filterDomain === 'noise' && r.targetType !== 'Noise Reduction') return false;
    }
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'In Progress':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Authority Intervention Matrix
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Prioritized Actions for Municipal & Pollution Control Authorities
          </h3>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none"
          >
            <option value="all">All Domains</option>
            <option value="air">Air Quality</option>
            <option value="noise">Noise Reduction</option>
          </select>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(item.priority)}`}>
                  {item.priority} Priority
                </span>
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {item.id} · {item.targetType}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.timeframe}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{item.location} ({item.city})</h4>
                <span className="text-[11px] font-mono text-teal-400">AI Confidence: {item.modelConfidence}%</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                <strong className="text-slate-400">Problem: </strong>
                {item.problemStatement}
              </p>
            </div>

            {/* Recommended Action Box */}
            <div className="mt-3.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-start space-x-2">
                <Send className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-teal-300">Recommended Action: </span>
                  <span className="text-slate-200">{item.recommendedAction}</span>
                </div>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500">Responsible Body: </span>
                <span className="font-semibold text-slate-300">{item.authorityResponsible}</span>
              </div>
              <div>
                <span className="text-slate-500">Projected Impact: </span>
                <span className="font-semibold text-emerald-400">{item.estimatedImpact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
