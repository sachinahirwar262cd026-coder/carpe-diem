import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive: boolean; // For pollution/noise: positive value means worsened (bad), or good? Let's format clearly
    label?: string;
  };
  badgeText?: string;
  badgeColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-teal-400',
  iconBg = 'bg-teal-500/10 border-teal-500/20',
  trend,
  badgeText,
  badgeColor = 'bg-slate-800 text-slate-300 border-slate-700',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-teal-500/40 hover:-translate-y-1 hover:shadow-teal-500/5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {badgeText && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl border ${iconBg} ${iconColor} shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <span className={`font-bold ${trend.isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
              {trend.value}
            </span>
            <span className="text-slate-400">{trend.label || 'vs last hour'}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">LSTM Live</span>
        </div>
      )}
    </div>
  );
};
