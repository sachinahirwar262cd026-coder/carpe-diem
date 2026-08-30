import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Download, Printer, RefreshCw, FileText, ShieldCheck } from 'lucide-react';
import { AiExecutiveSummary } from '../components/reports/AiExecutiveSummary';
import { PrioritizedActionsTable } from '../components/reports/PrioritizedActionsTable';
import { GovernmentReportModal } from '../components/reports/GovernmentReportModal';
import { CURRENT_AI_REPORT } from '../data/mockAiReports';

export const AiReportsPage: React.FC = () => {
  const { selectedCity } = useApp();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Environmental Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {selectedCity.name} · AI Decision Support & Action Dossier
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesizing sensor data, LSTM predictions, and citizen evidence into prioritized municipal action plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isGenerating ? 'Re-Synthesizing...' : 'Re-Run LLM Agent'}</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-xs font-bold transition shadow-lg shadow-purple-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Official CPCB Dossier</span>
          </button>
        </div>
      </div>

      {/* AI Executive Summary Component */}
      <AiExecutiveSummary />

      {/* Prioritized Authority Actions Matrix */}
      <PrioritizedActionsTable />

      {/* Printable Report Modal */}
      <GovernmentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
