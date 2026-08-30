import React from 'react';
import { CPCB_NOISE_STANDARDS } from '../../data/mockNoiseData';
import { ShieldCheck, Sun, Moon } from 'lucide-react';

export const NoiseStandardsGuide: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-teal-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-teal-400">
              National Statutory Regulatory Standard
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            CPCB Ambient Noise Thresholds in India
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
          Noise Pollution (Regulation &amp; Control) Rules, 2000
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CPCB_NOISE_STANDARDS.map((std) => (
          <div
            key={std.zone}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{std.zone}</h4>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <div className="flex items-center justify-center space-x-1 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                  <Sun className="w-3 h-3" />
                  <span>Day (6am-10pm)</span>
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {std.dayLimitDb} <span className="text-xs font-normal text-slate-400">dB</span>
                </p>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <div className="flex items-center justify-center space-x-1 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                  <Moon className="w-3 h-3" />
                  <span>Night (10pm-6am)</span>
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {std.nightLimitDb} <span className="text-xs font-normal text-slate-400">dB</span>
                </p>
              </div>
            </div>

            <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {std.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
