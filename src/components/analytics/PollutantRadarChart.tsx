import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { POLLUTANT_RADAR_DATA } from '../../data/mockAnalytics';
import { Compass, Sparkles } from 'lucide-react';

export const PollutantRadarChart: React.FC = () => {
  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Multi-Pocket Environmental Fingerprint
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Pollutant Footprint Comparison Across Micro-Pockets
          </h3>
        </div>
      </div>

      <div className="mt-4 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={POLLUTANT_RADAR_DATA}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
            <PolarRadiusAxis angle={30} domain={[0, 200]} stroke="#475569" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            <Radar
              name="Anand Vihar (Delhi)"
              dataKey="AnandVihar"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.25}
            />
            <Radar
              name="Silk Board (Bengaluru)"
              dataKey="SilkBoard"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.2}
            />
            <Radar
              name="BKC Metro (Mumbai)"
              dataKey="BKC"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.2}
            />
            <Radar
              name="Baikampady (NITK/Mangalore)"
              dataKey="Baikampady"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-center text-xs text-slate-400">
        Radar normalization based on CPCB standard threshold multiples.
      </p>
    </div>
  );
};
