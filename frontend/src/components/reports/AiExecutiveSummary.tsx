import React from 'react';
import { CURRENT_AI_REPORT, EnvironmentalReportSummary } from '../../data/mockAiReports';
import { Sparkles, AlertTriangle, CheckCircle, ShieldAlert, Wind, Volume2 } from 'lucide-react';

interface AiExecutiveSummaryProps {
  report?: EnvironmentalReportSummary;
}

export const AiExecutiveSummary: React.FC<AiExecutiveSummaryProps> = ({
  report = CURRENT_AI_REPORT,
}) => {
  return (
    <div className="space-y-6">
      {/* Executive Overview Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                LLM Environmental Decision Support Agent
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Autonomous Environmental Synthesis & Authority Advisory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Report ID: {report.reportId} · Period: {report.reportingPeriod}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              CPCB / Municipal Briefing
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Executive Synthesis
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed font-normal bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl">
            {report.executiveSummary}
          </p>
        </div>

        {/* Air vs Noise Status Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-teal-950/20 border border-teal-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-teal-400">
                <Wind className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Air Quality Dynamics</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                AQI {report.airQualityStatus.averageAqi} Avg
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                <strong className="text-slate-400">Worst Hotspot: </strong>
                <span className="text-rose-300 font-bold">{report.airQualityStatus.highestPocket}</span>
              </p>
              <p>
                <strong className="text-slate-400">Primary Stressor: </strong>
                <span>{report.airQualityStatus.dominantPollutant}</span>
              </p>
              <p>
                <strong className="text-slate-400">LSTM Trajectory: </strong>
                <span className="text-amber-300">{report.airQualityStatus.forecastTrend}</span>
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Volume2 className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Acoustic Stress Index</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Peak {report.noiseStatus.peakNoiseDb} dB(A)
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                <strong className="text-slate-400">Worst Zone: </strong>
                <span className="text-rose-300 font-bold">{report.noiseStatus.worstPocket}</span>
              </p>
              <p>
                <strong className="text-slate-400">Primary Source: </strong>
                <span>{report.noiseStatus.primaryCause}</span>
              </p>
              <p>
                <strong className="text-slate-400">Night Violations: </strong>
                <span className="text-amber-300">{report.noiseStatus.nighttimeViolationsCount} distinct incidents</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Highlights List */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
        <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Critical Hotspot Detections Requiring Immediate Intervention</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.criticalHighlights.map((highlight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3"
            >
              <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">{highlight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
