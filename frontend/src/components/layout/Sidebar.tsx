import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  FileWarning,
  Sparkles,
  Wind,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { complaints } = useApp();
  const activeComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;

  const navItems = [
    {
      name: 'Dashboard & Analytics',
      path: '/',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    },
    {
      name: 'Hotspot Cluster Map',
      path: '/hotspots',
      icon: MapPin,
      badge: null,
      badgeColor: '',
    },
    {
      name: 'Citizen Noise Grievances',
      path: '/complaints',
      icon: FileWarning,
      badge: activeComplaintsCount > 0 ? `${activeComplaintsCount} Active` : 'All Clear',
      badgeColor: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    },
    {
      name: 'AI Municipal Reports',
      path: '/reports',
      icon: Sparkles,
      badge: '15-Sec',
      badgeColor: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link to="/" onClick={onClose} className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-teal-500 flex items-center justify-center shadow-xs">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">Carpe Diem</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-teal-500/20 text-emerald-800 dark:text-teal-300 border border-emerald-200 dark:border-teal-500/30">
                  v3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Environmental Intelligence</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Platform Modules
            </p>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                  ? 'bg-emerald-50 dark:bg-teal-500/15 text-emerald-700 dark:text-teal-300 border border-emerald-200 dark:border-teal-500/30 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Telemetry Status Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">PranaAI Microservice</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">PORT 8001</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Attention Bi-LSTM</span>
              <span className="text-emerald-600 dark:text-teal-400 font-bold">R² = 0.813</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Official Indian CPCB NAQI &amp; 24h multi-horizon forecasting active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
