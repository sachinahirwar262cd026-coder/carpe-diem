import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, Sliders, Waves, Radio, Activity, TrendingUp, AlertTriangle, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { NoiseHeroCard } from '../components/noise/NoiseHeroCard';
import { TrafficNoiseEstimator } from '../components/noise/TrafficNoiseEstimator';
import { NoiseStandardsGuide } from '../components/noise/NoiseStandardsGuide';
import { fetchCityNoiseCorridors, CityCorridorsResponse, CorridorNoiseItem } from '../services/api/noiseService';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export const NoiseMonitoringPage: React.FC = () => {
  const { selectedCity } = useApp();
  const [cityData, setCityData] = useState<CityCorridorsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorNoiseItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchCityNoiseCorridors(selectedCity.name)
      .then((data) => {
        if (isMounted) {
          setCityData(data);
          if (data.corridors && data.corridors.length > 0) {
            setSelectedCorridor(data.corridors[0]);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCity.name]);

  const corridors = cityData?.corridors || [];
  const diurnalData = cityData?.diurnal_24h || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            <Waves className="w-4 h-4" />
            <span>Acoustic Surveillance &amp; CORTN Mathematical Synthesis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {selectedCity.name} · Road Traffic Noise &amp; CORTN Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous decibel estimation derived mathematically from vehicular volume (Q), fleet velocity (V), heavy commercial freight (p), and road topography.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 font-mono">
            {corridors.length} Arterial Corridors Evaluated
          </span>
        </div>
      </div>

      {/* Main City Acoustic Hero Card */}
      <NoiseHeroCard city={selectedCity} />

      {/* Interactive CORTN Mathematical Physics Estimator */}
      <TrafficNoiseEstimator />

      {/* 24-Hour Diurnal CORTN Acoustic Forecast Chart */}
      {diurnalData.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Diurnal Traffic Noise Dynamics</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                24-Hour Diurnal L_eq &amp; L_10 Acoustic Projection
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30 font-bold">
              Diurnal Cycle Synthesis
            </span>
          </div>

          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={diurnalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="noiseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[40, 95]} unit="dB" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 shadow-xl text-xs space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                            {data.hour} ({data.is_night ? 'Night' : 'Day'})
                          </div>
                          <div className="text-blue-600 dark:text-cyan-400 font-bold">
                            L_eq: {data.l_eq} dB(A)
                          </div>
                          <div className="text-slate-600 dark:text-slate-300">
                            Peak L_max: {data.l_max} dB(A)
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            Traffic Flow: {data.traffic_flow} veh/h ({data.speed_kmph} km/h)
                          </div>
                          <div className="text-amber-600 dark:text-amber-400 font-semibold">
                            CPCB Limit: {data.cpcb_limit} dB(A)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={65} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Commercial Day Limit (65 dB)', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={55} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Night Limit (55 dB)', fill: '#ef4444', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="l_eq"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#noiseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Dynamic CORTN Arterial Road Corridors Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>CORTN Roadway Registry</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Major Arterial Corridors &middot; Acoustic Sound Pressure Rankings
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Ranked by calculated L_eq decibels
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3">Corridor / Location</th>
                <th className="px-4 py-3">Zone Type</th>
                <th className="px-4 py-3 text-center">Flow (Q)</th>
                <th className="px-4 py-3 text-center">Speed (V)</th>
                <th className="px-4 py-3 text-center">Heavy (p%)</th>
                <th className="px-4 py-3 text-right">Calculated L_eq</th>
                <th className="px-4 py-3 text-right">CPCB Violation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
              {corridors.map((c) => {
                const isViolated = c.violation > 0;
                return (
                  <tr
                    key={c.name}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                        {c.zone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-700 dark:text-slate-300">
                      {c.traffic_flow.toLocaleString()} veh/h
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-700 dark:text-slate-300">
                      {c.speed_kmph} km/h
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-700 dark:text-slate-300">
                      {c.heavy_pct}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-sm text-blue-600 dark:text-cyan-400">
                      {c.l_eq} dB(A)
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isViolated ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                          +{c.violation} dB
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                          Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official CPCB Noise Rules Reference */}
      <NoiseStandardsGuide />
    </div>
  );
};
