import React from 'react';
import { Download, X, Shield, FileText, Printer } from 'lucide-react';

interface GovernmentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveReportMarkdown?: string;
}

export const GovernmentReportModal: React.FC<GovernmentReportModalProps> = ({
  isOpen,
  onClose,
  liveReportMarkdown,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (liveReportMarkdown) {
      const blob = new Blob([liveReportMarkdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CPCB_Environmental_Dossier_${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-teal-500/10 text-emerald-600 dark:text-teal-400 border border-emerald-200 dark:border-teal-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Official Environmental Intelligence Action Dossier
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Ministry of Environment, Forest and Climate Change &amp; CPCB Compliance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 text-xs font-bold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-5 bg-slate-50 dark:bg-slate-950/80 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
          {/* Institutional Header */}
          <div className="text-center pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 text-emerald-800 dark:text-teal-400 font-bold mb-2">
              <Shield className="w-4 h-4" />
              <span>Central Pollution Control Board &middot; Municipal Decision Support</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Automated Environmental Intelligence &amp; Enforcement Dossier
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Presented by <strong>Team Carpe diem</strong> &middot; Multi-Sensor Fusion &amp; Deep Forecasting
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              Generated: {new Date().toLocaleString('en-IN')} &middot; Attention Bi-LSTM + Groq LLM Agent
            </p>
          </div>

          {/* Formatted Report */}
          {liveReportMarkdown ? (
            <div
              className="space-y-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderModalReport(liveReportMarkdown) }}
            />
          ) : (
            <div className="text-center py-10 text-slate-400">
              No report generated yet. Click &quot;Generate Official Dossier&quot; on the Reports page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function renderModalReport(md: string): string {
  let html = md;
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xs font-bold text-emerald-700 dark:text-teal-300 uppercase tracking-wider mt-4 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-sm font-black text-slate-900 dark:text-white mt-5 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-base font-black text-slate-900 dark:text-white mt-3 mb-2">$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900 dark:text-slate-100 font-bold">$1</strong>');

  // Format Tables
  const lines = html.split('\n');
  const processed: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (/^\|[\s\-:|]+\|$/.test(line)) continue;
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else {
      if (inTable) {
        processed.push(formatModalTable(tableRows));
        inTable = false;
        tableRows = [];
      }
      processed.push(line);
    }
  }
  if (inTable) processed.push(formatModalTable(tableRows));
  html = processed.join('\n');

  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-600 dark:text-slate-300 text-xs mb-1">$1</li>');
  html = html.replace(/\n\n/g, '<br/>');
  return html;
}

function formatModalTable(rows: string[]): string {
  if (rows.length === 0) return '';
  const headers = rows[0].split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim());
  let out = `
    <div class="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase text-[10px]">
            ${headers.map(h => `<th class="px-3 py-2">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
  `;

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r].split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim());
    out += `<tr class="${r % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-950/30' : 'bg-white dark:bg-slate-900'}">`;
    cells.forEach(c => {
      out += `<td class="px-3 py-2 text-slate-700 dark:text-slate-300">${c}</td>`;
    });
    out += `</tr>`;
  }
  out += `</tbody></table></div>`;
  return out;
}
