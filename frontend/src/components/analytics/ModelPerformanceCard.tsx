import React from 'react';
import { AI_RESEARCH_MODELS } from '../../data/mockAnalytics';
import { Cpu, CheckCircle2, Award, Zap, Database } from 'lucide-react';

export const ModelPerformanceCard: React.FC = () => {
  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Team Carpe diem AI Architecture & Benchmarks
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Machine Learning Model Metrics & Performance
          </h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          All Models Active in Inference
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_RESEARCH_MODELS.map((model) => (
          <div
            key={model.name}
            className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">{model.name}</h4>
                  <p className="text-[11px] text-teal-400 font-mono mt-0.5">{model.architecture}</p>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  {model.accuracy} Acc
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                {model.purpose}
              </p>

              {/* Research Metrics Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">R² Score</span>
                  <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">{model.r2}</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">RMSE</span>
                  <p className="text-sm font-black text-cyan-400 font-mono mt-0.5">{model.rmse}</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">MAE</span>
                  <p className="text-sm font-black text-amber-400 font-mono mt-0.5">{model.mae}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Latency: {model.inferenceSpeed}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-teal-400" />
                <span className="truncate max-w-[160px]">{model.trainingDataset.split('+')[0]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
