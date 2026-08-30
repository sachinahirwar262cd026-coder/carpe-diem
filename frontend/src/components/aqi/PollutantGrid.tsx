import React from 'react';
import { MOCK_POLLUTANTS } from '../../data/mockAqiData';
import { Pollutant } from '../../types';
import { getAqiBadgeStyle } from '../../utils/helpers';
import { Activity } from 'lucide-react';

interface PollutantGridProps {
  pollutants?: Pollutant[];
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({
  pollutants = MOCK_POLLUTANTS,
}) => {
  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Chemical & Particulate Composition
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Key Pollutants Telemetry
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span className="hidden sm:inline">NAAQS Standards</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pollutants.map((item) => {
          const badge = getAqiBadgeStyle(item.status);
          const isHigh = item.value > item.standard;

          return (
            <div
              key={item.name}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-black text-white group-hover:text-teal-300 transition">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">({item.chemical})</span>
                  </div>
                  <div className="mt-2 flex items-baseline space-x-1.5">
                    <span className="text-2xl font-black text-white">{item.value}</span>
                    <span className="text-xs text-slate-400 font-mono">{item.unit}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {item.status}
                </span>
              </div>

              {/* Progress meter vs National Standard */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Standard: {item.standard} {item.unit}</span>
                  <span className={isHigh ? 'text-rose-400 font-bold' : 'text-emerald-400 font-medium'}>
                    {((item.value / item.standard) * 100).toFixed(0)}% of limit
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.value > item.standard * 1.5
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500'
                        : item.value > item.standard
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((item.value / (item.standard * 2)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
