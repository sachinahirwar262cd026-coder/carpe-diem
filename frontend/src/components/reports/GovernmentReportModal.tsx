import React from 'react';
import { CURRENT_AI_REPORT } from '../../data/mockAiReports';
import { Printer, Download, X, Shield, FileText, CheckCircle2, AlertOctagon } from 'lucide-react';

interface GovernmentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GovernmentReportModal: React.FC<GovernmentReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(CURRENT_AI_REPORT, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SIH2026_CPCB_Environmental_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Official SIH 2026 Environmental Action Dossier
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Document Ref: {CURRENT_AI_REPORT.reportId} · Generated for CPCB / SPCB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-teal-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON/Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar bg-slate-950/80 p-6 rounded-2xl border border-slate-800 text-xs text-slate-300">
          {/* Government / Institutional Header */}
          <div className="text-center pb-5 border-b border-slate-800">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-teal-400 font-bold mb-2">
              <Shield className="w-4 h-4" />
              <span>Smart India Hackathon 2026 · Ministry of Environment & CPCB</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-wide uppercase">
              Intelligent Air & Noise Pollution Monitoring & Predictive Action Report
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Presented by <strong>Team Carpe diem</strong> (National Institute of Technology Surathkal)
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Generated: {CURRENT_AI_REPORT.generatedDate} · Model Consensus: WVPBL-BiLSTM + CORTN + ResNet-18
            </p>
          </div>

          {/* Section 1: Executive Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
              1. Executive Overview & Meteorological Synthesis
            </h4>
            <p className="leading-relaxed text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              {CURRENT_AI_REPORT.executiveSummary}
            </p>
          </div>

          {/* Section 2: Key Environmental Indicators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
              2. Key Real-Time Stress Indicators
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Mean Metropolitan AQI</span>
                <p className="text-lg font-black text-amber-400 mt-0.5">{CURRENT_AI_REPORT.airQualityStatus.averageAqi}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Peak Ambient Sound</span>
                <p className="text-lg font-black text-rose-400 mt-0.5">{CURRENT_AI_REPORT.noiseStatus.peakNoiseDb} dB(A)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Active Hotspot Pockets</span>
                <p className="text-lg font-black text-cyan-400 mt-0.5">4 Locations</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Verified Citizen Reports</span>
                <p className="text-lg font-black text-emerald-400 mt-0.5">6 Validated</p>
              </div>
            </div>
          </div>

          {/* Section 3: Recommended Interventions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
              3. Recommended Municipal & Police Enforcement Actions
            </h4>
            <div className="space-y-2.5">
              {CURRENT_AI_REPORT.recommendations.map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span>{rec.id}: {rec.location} ({rec.targetType})</span>
                    <span className="text-[10px] text-rose-400 uppercase font-mono">{rec.priority} Priority</span>
                  </div>
                  <p className="text-slate-300 mb-1.5"><strong className="text-slate-400">Action: </strong>{rec.recommendedAction}</p>
                  <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                    <span>Dept: <strong>{rec.authorityResponsible}</strong></span>
                    <span>Expected Result: <strong className="text-emerald-400">{rec.estimatedImpact}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
