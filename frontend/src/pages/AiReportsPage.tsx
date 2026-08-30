import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Download, RefreshCw, FileText } from 'lucide-react';
import { AiExecutiveSummary } from '../components/reports/AiExecutiveSummary';
import { PrioritizedActionsTable } from '../components/reports/PrioritizedActionsTable';
import { GovernmentReportModal } from '../components/reports/GovernmentReportModal';
import { generateReport } from '../services/api/airQualityService';

export const AiReportsPage: React.FC = () => {
  const { selectedCity } = useApp();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const data = await generateReport(selectedCity.name);
      setReportMarkdown(data.report_markdown || '');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to generate report: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenDossier = async () => {
    if (!reportMarkdown) {
      // Auto-generate if not yet generated
      setIsGenerating(true);
      setError('');
      try {
        const data = await generateReport(selectedCity.name);
        setReportMarkdown(data.report_markdown || '');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to generate report: ${message}`);
        setIsGenerating(false);
        return;
      }
      setIsGenerating(false);
    }
    setIsReportModalOpen(true);
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
            {selectedCity.name} · AI Decision Support &amp; Action Dossier
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesizing live sensor telemetry, Bi-LSTM predictions, and CPCB data into prioritized municipal action plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isGenerating ? 'Generating Report...' : 'Re-Run LLM Agent'}</span>
          </button>

          <button
            onClick={handleOpenDossier}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-xs font-bold transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Official CPCB Dossier</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Live Report Preview (if generated) */}
      {reportMarkdown && (
        <div className="rounded-3xl bg-slate-900/80 border border-purple-500/30 p-6 shadow-xl">
          <div className="flex items-center space-x-2 text-purple-400 mb-4">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Live AI Report Preview</span>
          </div>
          <div
            className="prose prose-invert prose-sm max-w-none text-slate-200"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(reportMarkdown) }}
          />
        </div>
      )}

      {/* Static AI Executive Summary */}
      <AiExecutiveSummary />

      {/* Prioritized Authority Actions */}
      <PrioritizedActionsTable />

      {/* Printable Report Modal */}
      <GovernmentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        liveReportMarkdown={reportMarkdown}
      />
    </div>
  );
};

/** Minimal markdown → HTML converter (headings, bold, tables, bullets) */
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-white mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-black text-teal-300 mt-6 mb-2 border-b border-slate-700 pb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-black text-white mt-4 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100">$1</strong>')
    .replace(/^\| (.+) \|$/gm, (row) => {
      const cells = row.split('|').filter(Boolean).map(c => c.trim());
      return '<tr>' + cells.map(c => `<td class="border border-slate-700 px-2 py-1">${c}</td>`).join('') + '</tr>';
    })
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>')
    .replace(/\n\n/g, '<br/>')
    .replace(/<\/li>\n<li/g, '</li><li');
}
