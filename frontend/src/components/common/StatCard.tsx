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
    isPositive: boolean;
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
  iconColor = 'text-emerald-600 dark:text-teal-400',
  iconBg = 'bg-emerald-50 dark:bg-teal-500/10 border-emerald-200 dark:border-teal-500/20',
  trend,
  badgeText,
  badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition ${
        onClick ? 'cursor-pointer hover:border-emerald-500/40 dark:hover:border-teal-500/40 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</span>
            {badgeText && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
        </div>

        <div className={`p-2.5 rounded-xl border ${iconBg} ${iconColor} shrink-0 ml-3`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 truncate">
            <span className={`font-bold ${trend.isPositive ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {trend.value}
            </span>
            <span className="text-slate-500 dark:text-slate-400 truncate">{trend.label || 'vs baseline'}</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">Live</span>
        </div>
      )}
    </div>
  );
};
