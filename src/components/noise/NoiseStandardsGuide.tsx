import React from 'react';
import { CPCB_NOISE_STANDARDS } from '../../data/mockNoiseData';
import { ShieldCheck, Sun, Moon, MapPin } from 'lucide-react';

export const NoiseStandardsGuide: React.FC = () => {
  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Regulatory Compliance
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            CPCB Ambient Noise Standards in India
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">Noise Pollution (Regulation & Control) Rules</span>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {CPCB_NOISE_STANDARDS.map((std) => (
          <div
            key={std.zone}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <h4 className="text-sm font-bold text-white">{std.zone}</h4>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="flex items-center justify-center space-x-1 text-amber-400 text-[10px] font-bold">
                  <Sun className="w-3 h-3" />
                  <span>Day (6am-10pm)</span>
                </div>
                <p className="text-lg font-black text-white mt-0.5">{std.dayLimitDb} <span className="text-xs font-normal text-slate-400">dB</span></p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="flex items-center justify-center space-x-1 text-indigo-400 text-[10px] font-bold">
                  <Moon className="w-3 h-3" />
                  <span>Night (10pm-6am)</span>
                </div>
                <p className="text-lg font-black text-white mt-0.5">{std.nightLimitDb} <span className="text-xs font-normal text-slate-400">dB</span></p>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
              {std.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
