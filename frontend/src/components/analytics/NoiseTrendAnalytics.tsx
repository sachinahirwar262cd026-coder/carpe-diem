import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TRAFFIC_VS_NOISE_CORRELATION } from '../../data/mockAnalytics';
import { Volume2, Car, Activity } from 'lucide-react';

export const NoiseTrendAnalytics: React.FC = () => {
  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Acoustic Diurnal Profiles
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Traffic Congestion vs. Measured Decibels (dB)
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-cyan-300 font-mono">
          <Car className="w-3.5 h-3.5" />
          <span>CORTN Traffic Regression</span>
        </div>
      </div>

      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TRAFFIC_VS_NOISE_CORRELATION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="noiseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[40, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            {/* Measured Sound Pressure */}
            <Area
              type="monotone"
              dataKey="noiseDb"
              name="Measured Sound dB(A)"
              stroke="#06b6d4"
              strokeWidth={3}
              fill="url(#noiseAreaGrad)"
            />

            {/* CORTN AI Estimated Sound */}
            <Line
              type="monotone"
              dataKey="cortnEstimatedDb"
              name="CORTN AI Estimation"
              stroke="#a855f7"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={{ r: 3, fill: '#a855f7' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
        <span>Strong positive correlation ($r = 0.93$) between low vehicular speeds and peak acoustic spikes.</span>
        <span className="font-mono text-cyan-400">TomTom Traffic Telemetry</span>
      </div>
    </div>
  );
};
