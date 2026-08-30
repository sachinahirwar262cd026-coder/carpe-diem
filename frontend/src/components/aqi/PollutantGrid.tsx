import React from 'react';
import { MOCK_POLLUTANTS } from '../../data/mockAqiData';
import { Pollutant } from '../../types';
import { getAqiBadgeStyle } from '../../utils/helpers';
import { Activity } from 'lucide-react';

interface PollutantGridProps {
  pollutants?: Pollutant[];
  liveConcentrations?: Record<string, number>;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({
  pollutants = MOCK_POLLUTANTS,
  liveConcentrations,
}) => {
  const displayPollutants = pollutants.map((p) => {
    if (liveConcentrations) {
      const keyMap: Record<string, string> = {
        'PM 2.5': 'pm2_5',
        'PM 10': 'pm10',
        'NO2': 'no2',
        'SO2': 'so2',
        'CO': 'co',
        'Ozone': 'o3',
        'NH3': 'nh3',
      };
      const apiKey = keyMap[p.name] || p.chemical.toLowerCase();
      if (liveConcentrations[apiKey] !== undefined) {
        const val = liveConcentrations[apiKey];
        return {
          ...p,
          value: val,
          status: (val > p.standard * 1.5 ? 'Very Poor' : val > p.standard ? 'Poor' : val > p.standard * 0.5 ? 'Moderate' : 'Good') as Pollutant['status'],
        };
      }
    }
    return p;
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
              Chemical &amp; Particulate Decomposition
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Real-Time Pollutant Concentrations
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400" />
          <span className="hidden sm:inline">CPCB NAAQS Benchmark</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayPollutants.map((item) => {
          const badge = getAqiBadgeStyle(item.status);
          const isHigh = item.value > item.standard;

          return (
            <div
              key={item.name}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">({item.chemical})</span>
                  </div>
                  <div className="mt-2 flex items-baseline space-x-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.unit}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {item.status}
                </span>
              </div>

              {/* Progress meter vs National Standard */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span>Limit: {item.standard} {item.unit}</span>
                  <span className={isHigh ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
                    {((item.value / item.standard) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.value > item.standard * 1.5
                        ? 'bg-rose-500'
                        : item.value > item.standard
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((item.value / (item.standard * 2)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
