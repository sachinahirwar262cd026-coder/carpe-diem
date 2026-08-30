import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/40 py-6 px-4 lg:px-8 text-xs text-slate-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-200">SmartPoll India · SIH 2026</span>
            <span className="text-slate-500 mx-2">|</span>
            <span>Intelligent Air & Noise Pollution Monitoring & Prediction</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <span>Developed with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>by <strong className="text-teal-400 font-semibold">Team Carpe diem</strong> · NIT Surathkal</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-500">
          <span>CPCB Standards Compliant</span>
          <span>•</span>
          <span>LSTM + CORTN AI Models</span>
          <span>•</span>
          <span>Continuous Ambient Telemetry</span>
        </div>
      </div>
    </footer>
  );
};
