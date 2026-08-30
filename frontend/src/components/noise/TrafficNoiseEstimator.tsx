import React, { useState, useMemo } from 'react';
import { Sliders, Car, Truck, Gauge, Cpu, CheckCircle2 } from 'lucide-react';
import { getNoiseBadgeStyle } from '../../utils/helpers';

export const TrafficNoiseEstimator: React.FC = () => {
  const [vehiclesPerHour, setVehiclesPerHour] = useState<number>(2400);
  const [heavyVehiclePercent, setHeavyVehiclePercent] = useState<number>(18);
  const [averageSpeedKmph, setAverageSpeedKmph] = useState<number>(35);
  const [roadSurface, setRoadSurface] = useState<'asphalt' | 'concrete' | 'porous'>('asphalt');

  // Realistic CORTN (Calculation of Road Traffic Noise) formula approximation
  const calculatedDb = useMemo(() => {
    // Basic CORTN relationship: L10(18-hour) = 10*log10(Q) + 33*log10(V + 40 + 500/V) + 10*log10(1 + 5*p/V) - 27.6
    const q = Math.max(vehiclesPerHour, 100);
    const v = Math.max(averageSpeedKmph, 10);
    const p = heavyVehiclePercent;

    let baseDb = 10 * Math.log10(q) + 33 * Math.log10(v + 40 + 500 / v) + 10 * Math.log10(1 + (5 * p) / v) - 27.6;
    
    // Surface correction
    if (roadSurface === 'concrete') baseDb += 2.5;
    if (roadSurface === 'porous') baseDb -= 3.5;

    return Math.min(Math.max(baseDb, 45), 98).toFixed(1);
  }, [vehiclesPerHour, heavyVehiclePercent, averageSpeedKmph, roadSurface]);

  const numDb = parseFloat(calculatedDb);
  const badgeStyle = getNoiseBadgeStyle(numDb);

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Interactive CORTN Simulation
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Traffic-to-Noise Mathematical Predictor
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40 font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>Real-time Traffic AI Physics</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400 leading-relaxed">
        Adjust vehicular traffic flow, heavy freight percentage, and street speed to witness how our AI models compute street sound pressure without installing costly hardware microphones across thousands of kilometers.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Area */}
        <div className="lg:col-span-7 space-y-5">
          {/* Slider 1: Vehicles Per Hour */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <Car className="w-3.5 h-3.5 text-teal-400" />
                <span>Traffic Flow Volume (Q):</span>
              </span>
              <span className="font-mono font-black text-teal-400 text-sm">
                {vehiclesPerHour.toLocaleString()} vehicles/hr
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={vehiclesPerHour}
              onChange={(e) => setVehiclesPerHour(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>Light (200)</span>
              <span>Moderate (2,500)</span>
              <span>Severe Gridlock (5,000)</span>
            </div>
          </div>

          {/* Slider 2: Heavy Commercial Vehicles % */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Heavy Trucks & Buses Percentage (p):</span>
              </span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {heavyVehiclePercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={heavyVehiclePercent}
              onChange={(e) => setHeavyVehiclePercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0% (Cars only)</span>
              <span>25% (Mixed Corridor)</span>
              <span>50% (Industrial Freight)</span>
            </div>
          </div>

          {/* Slider 3: Average Vehicle Speed */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Average Traffic Speed (V):</span>
              </span>
              <span className="font-mono font-black text-cyan-400 text-sm">
                {averageSpeedKmph} km/h
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={averageSpeedKmph}
              onChange={(e) => setAverageSpeedKmph(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>10 km/h (Crawl)</span>
              <span>50 km/h (Arterial)</span>
              <span>100 km/h (Expressway)</span>
            </div>
          </div>

          {/* Road Surface Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-400">Road Surface:</span>
            {(['asphalt', 'concrete', 'porous'] as const).map((surface) => (
              <button
                key={surface}
                onClick={() => setRoadSurface(surface)}
                className={`px-3 py-1 rounded-lg capitalize text-xs font-semibold transition ${
                  roadSurface === surface
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {surface}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Decibel Output Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex flex-col justify-between text-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Predicted Street Noise
            </span>
            <div className="my-4 flex items-center justify-center space-x-2">
              <span className="text-6xl font-black text-white">{calculatedDb}</span>
              <span className="text-xl font-bold text-cyan-400">dB(A)</span>
            </div>

            <div className="inline-block">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                {badgeStyle.label}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-left space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">CPCB Permissible Limit (Day):</span>
              <span className="font-mono font-bold text-slate-200">65.0 dB(A)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Violation Margin:</span>
              <span className={`font-mono font-bold ${numDb > 65 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {numDb > 65 ? `+${(numDb - 65).toFixed(1)} dB (Exceeded)` : 'Within Safe Norms'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
