import React from 'react';
import { getAqiColor, getAqiCategory, getAqiBadgeStyle } from '../../utils/helpers';

interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  unit?: string;
  type?: 'aqi' | 'noise';
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max = 500,
  label,
  unit = 'AQI',
  type = 'aqi',
}) => {
  // Normalize value between 0 and 100% of the half-circle (180 deg)
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const angle = (percentage / 100) * 180; // 0 to 180 deg

  const aqiColor = type === 'aqi' ? getAqiColor(value) : value > 75 ? '#ef4444' : value > 65 ? '#f59e0b' : '#10b981';
  const category = type === 'aqi' ? getAqiCategory(value) : value > 75 ? 'Very Loud' : value > 65 ? 'Moderate' : 'Quiet';
  const badgeStyle = getAqiBadgeStyle(category as any);

  // SVG parameters for a clean semi-circle gauge
  const radius = 75;
  const strokeWidth = 14;
  const cx = 90;
  const cy = 90;
  const circumference = Math.PI * radius; // Half-circle circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-28 flex items-end justify-center">
        <svg viewBox="0 0 180 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="75%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active progress arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={type === 'aqi' ? 'url(#gaugeGradient)' : aqiColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Value */}
        <div className="absolute bottom-0 text-center flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ color: aqiColor }}>
            {value}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{unit}</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
          {category}
        </span>
        {label && <p className="mt-1.5 text-xs text-slate-400 font-medium">{label}</p>}
      </div>
    </div>
  );
};
