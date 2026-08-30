import React from 'react';
import { AlertOctagon, HeartHandshake, ShieldAlert, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlertBannerProps {
  id: string;
  type: 'asthma' | 'noise' | 'severe-aqi';
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  onDismiss?: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  id,
  type,
  title,
  message,
  actionText,
  actionLink,
  onDismiss,
}) => {
  const getStyle = () => {
    switch (type) {
      case 'asthma':
        return {
          bg: 'bg-gradient-to-r from-rose-950/70 via-rose-900/40 to-slate-900',
          border: 'border-rose-500/40',
          iconColor: 'text-rose-400',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          badgeText: 'ASTHMA ADVISORY',
          icon: HeartHandshake,
        };
      case 'noise':
        return {
          bg: 'bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-slate-900',
          border: 'border-amber-500/40',
          iconColor: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          badgeText: 'HIGH NOISE SURGE',
          icon: ShieldAlert,
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-purple-950/70 via-purple-900/40 to-slate-900',
          border: 'border-purple-500/40',
          iconColor: 'text-purple-400',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          badgeText: 'CRITICAL HOTSPOT',
          icon: AlertOctagon,
        };
    }
  };

  const style = getStyle();
  const Icon = style.icon;

  return (
    <div
      className={`relative rounded-2xl ${style.bg} border ${style.border} p-4 sm:p-5 shadow-lg backdrop-blur-md transition-all duration-300`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 ${style.iconColor} shadow-inner`}>
            <Icon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
                {style.badgeText}
              </span>
              <h4 className="text-sm font-bold text-white">{title}</h4>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-3xl">{message}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {actionText && actionLink && (
            <Link
              to={actionLink}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition backdrop-blur-sm whitespace-nowrap"
            >
              {actionText}
            </Link>
          )}

          {onDismiss && (
            <button
              onClick={() => onDismiss(id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              aria-label="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
