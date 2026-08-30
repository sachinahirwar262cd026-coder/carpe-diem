import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Download,
  RefreshCw,
  FileText,
  Shield,
  FileCheck,
  Copy,
  Check,
  Printer,
  ChevronRight,
  Cpu,
  Layers,
  Building,
} from 'lucide-react';
import { GovernmentReportModal } from '../components/reports/GovernmentReportModal';
import { generateReport } from '../services/api/airQualityService';

export const AiReportsPage: React.FC = () => {
  const { selectedCity } = useApp();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
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

  const handleCopy = () => {
    if (!reportMarkdown) return;
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!reportMarkdown) return;
    const blob = new Blob([reportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CPCB_Environmental_Intelligence_Dossier_${selectedCity.name}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Municipal Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {selectedCity.name} · Official Environmental Action Dossier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            15-Section official decision-support report powered by Attention Bi-LSTM predictions, CPCB NAQI standard, and Groq LLM agent.
          </p>
        </div>

        {reportMarkdown && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 text-xs font-bold transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-purple-500' : ''}`} />
              <span>Re-Run</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Initial State / Generation Hero Card (When No Report Yet) */}
      {!reportMarkdown && !isGenerating && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-8 h-8" />
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Generate Official 15-Section Intelligence Dossier
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Synthesize real-time atmospheric telemetry for <strong>{selectedCity.name}</strong>, 24-hour Attention Bi-LSTM predictions, CPCB NAQI compliance thresholds, and global environmental benchmarks into an executive municipal action plan.
            </p>
          </div>

          {/* Core Pipeline Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-teal-400 text-xs font-bold mb-1">
                <Cpu className="w-4 h-4" />
                <span>Deep Learning Forecast</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hourly multi-parameter trend predictions for PM2.5, PM10, NO2, and SO2.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-cyan-400 text-xs font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>CPCB NAQI Standards</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Indian NAAQS sub-index breakpoints and prominent pollutant detection.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 text-xs font-bold mb-1">
                <Building className="w-4 h-4" />
                <span>Municipal Action Matrix</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prioritized enforcement interventions with designated departmental authority.
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={handleGenerate}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-sm transition shadow-xs inline-flex items-center space-x-2.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Official Dossier for {selectedCity.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading Progress State */}
      {isGenerating && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-5 shadow-xs">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-3 border-purple-200 dark:border-purple-900/40 border-t-purple-600 dark:border-t-teal-400 rounded-full animate-spin" />
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-teal-400 absolute inset-0 m-auto" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Synthesizing 15-Section Intelligence Dossier...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Querying live continuous ambient air stations for {selectedCity.name}, computing 24h Attention Bi-LSTM predictions, and generating municipal action matrix.
            </p>
          </div>

          <div className="w-full max-w-sm mx-auto bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-teal-400 h-full rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* Live Generated Report View */}
      {reportMarkdown && !isGenerating && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center space-x-2.5">
              <FileCheck className="w-5 h-5 text-emerald-600 dark:text-teal-400" />
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Official 15-Section Municipal Dossier · {selectedCity.name}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-teal-300 bg-emerald-50 dark:bg-teal-500/10 border border-emerald-200 dark:border-teal-500/30 px-2.5 py-1 rounded-lg">
              PranaAI + Groq Agent
            </span>
          </div>

          {/* Beautified Markdown & Data Tables */}
          <div
            className="report-content prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: beautifyReportHtml(reportMarkdown) }}
          />
        </div>
      )}

      {/* Formal Printable Report Modal */}
      <GovernmentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        liveReportMarkdown={reportMarkdown}
      />
    </div>
  );
};

/** Beautifies Markdown into Modern Enterprise HTML with High-Contrast Data Tables */
function beautifyReportHtml(md: string): string {
  let html = md;

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-emerald-700 dark:text-teal-300 mt-5 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-base font-black text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center space-x-2"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2"></span>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-black text-slate-900 dark:text-white mt-4 mb-3">$1</h1>');

  // Bold text
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900 dark:text-slate-100 font-bold">$1</strong>');

  // Tables Converter
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if separator line
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        continue; // Skip markdown separator row
      }

      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else {
      if (inTable) {
        processedLines.push(renderBeautifiedTable(tableRows));
        inTable = false;
        tableRows = [];
      }
      processedLines.push(line);
    }
  }

  if (inTable) {
    processedLines.push(renderBeautifiedTable(tableRows));
  }

  html = processedLines.join('\n');

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-600 dark:text-slate-300 text-xs mb-1">$1</li>');
  html = html.replace(/<\/li>\n<li/g, '</li><li');

  // Paragraph breaks
  html = html.replace(/\n\n/g, '<br/>');

  return html;
}

/** Formats extracted markdown table rows into modern enterprise data tables with badges */
function renderBeautifiedTable(rows: string[]): string {
  if (rows.length === 0) return '';

  const headerCells = rows[0]
    .split('|')
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    .map((c) => c.trim());

  let tableHtml = `
    <div class="my-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase text-[10px] tracking-wider">
              ${headerCells.map((h) => `<th class="px-4 py-3">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/50">
  `;

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]
      .split('|')
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      .map((c) => c.trim());

    const isEven = r % 2 === 0;
    tableHtml += `<tr class="${isEven ? 'bg-slate-50/50 dark:bg-slate-950/30' : 'bg-white dark:bg-slate-900/40'} hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition">`;

    cells.forEach((cell, cellIdx) => {
      let formattedCell = cell;

      // Priority formatting badge
      if (cellIdx === 2 || cell.toLowerCase().includes('critical') || cell.toLowerCase().includes('high') || cell.toLowerCase().includes('medium')) {
        if (/critical/i.test(cell)) {
          formattedCell = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">Critical</span>`;
        } else if (/high/i.test(cell)) {
          formattedCell = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">High</span>`;
        } else if (/medium/i.test(cell)) {
          formattedCell = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">Medium</span>`;
        }
      }

      tableHtml += `<td class="px-4 py-2.5 text-slate-700 dark:text-slate-300">${formattedCell}</td>`;
    });

    tableHtml += `</tr>`;
  }

  tableHtml += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  return tableHtml;
}
