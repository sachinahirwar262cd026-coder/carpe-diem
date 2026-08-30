import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Wind,
  Volume2,
  MapPin,
  FileWarning,
  BarChart3,
  Sparkles,
  ShieldCheck,
  X,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeAlertCount, complaints } = useApp();

  const navItems = [
    {
      name: 'Overview Dashboard',
      path: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Air Quality & Forecast',
      path: '/air-quality',
      icon: Wind,
      badge: activeAlertCount > 0 ? `${activeAlertCount} Alert` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      name: 'Noise Surveillance',
      path: '/noise-monitoring',
      icon: Volume2,
      badge: 'CORTN',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      name: 'Hotspot Cluster Map',
      path: '/hotspots',
      icon: MapPin,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Citizen Grievances',
      path: '/complaints',
      icon: FileWarning,
      badge: complaints.length > 0 ? `${complaints.length}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      name: 'Analytics & Models',
      path: '/analytics',
      icon: BarChart3,
      badge: 'Bi-LSTM',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      name: 'AI Municipal Reports',
      path: '/reports',
      icon: Sparkles,
      badge: 'Groq AI',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" onClick={onClose} className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-[1.5px] shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wind className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg tracking-tight text-white">Carpe Diem</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  v3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Environmental Intelligence</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core Modules
            </p>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Telemetry Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-300 text-[11px]">PranaAI Microservice</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">PORT 8001</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
              <span>Bi-LSTM + LightGBM</span>
              <span className="text-teal-400 font-bold">R² = 0.813</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Real-time CPCB NAQI &amp; 24h multi-horizon forecasting active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
