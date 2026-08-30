import React from 'react';
import { MicroPocket } from '../../types';
import { getAqiBadgeStyle } from '../../utils/helpers';
import { MapPin, AlertCircle, ArrowUpRight } from 'lucide-react';

interface MicroPocketTableProps {
  pockets: MicroPocket[];
  selectedPocket: MicroPocket | null;
  onSelectPocket: (pocket: MicroPocket) => void;
}

export const MicroPocketTable: React.FC<MicroPocketTableProps> = ({
  pockets,
  selectedPocket,
  onSelectPocket,
}) => {
  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Neighborhood-Level Resolution
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Micro-Pocket AQI & Noise Comparison
          </h3>
        </div>
        <p className="text-xs text-slate-400">Click any row to inspect local LSTM forecast</p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Neighborhood Pocket</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">AQI Level</th>
              <th className="py-3 px-4">Dominant Pollutant</th>
              <th className="py-3 px-4">Noise dB(A)</th>
              <th className="py-3 px-4">CPCB Station Gap</th>
              <th className="py-3 px-4 text-right">Hotspot Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {pockets.map((pocket) => {
              const badge = getAqiBadgeStyle(pocket.category);
              const isSelected = selectedPocket?.id === pocket.id;

              return (
                <tr
                  key={pocket.id}
                  onClick={() => onSelectPocket(pocket)}
                  className={`cursor-pointer transition duration-150 ${
                    isSelected
                      ? 'bg-teal-500/10 text-white font-semibold'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-teal-400 ring-4 ring-teal-500/20' : 'bg-slate-600'}`} />
                      <span className="font-bold text-white text-xs">{pocket.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{pocket.zone}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <span>{pocket.aqi}</span>
                      <span className="text-[9px] opacity-80">· {pocket.category}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">{pocket.dominantPollutant}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{pocket.noiseDb} dB</td>
                  <td className="py-3.5 px-4 text-slate-400">{pocket.cpcbStationDistance}</td>
                  <td className="py-3.5 px-4 text-right">
                    {pocket.isHotspot ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        <span>Active Hotspot ({pocket.activeComplaints})</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Normal</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
