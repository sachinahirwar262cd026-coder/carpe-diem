import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Wind,
  Volume2,
  MapPin,
  FileWarning,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Radio,
  X,
  Camera,
  Mic,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { activeAlertCount, complaints, theme, setTheme } = useApp();
  const { user, activePortal, setActivePortal } = useAuth();

  const unverifiedComplaintsCount = complaints.filter(
    (c) => c.status === 'Pending AI Review' || c.status === 'Verified Hotspot'
  ).length;

  const citizenNavItems = [
    {
      name: 'Citizen Dashboard',
      path: '/citizen',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Upload Air Evidence',
      path: '/citizen/air-evidence',
      icon: Camera,
      badge: 'Photo AI',
      badgeColor: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
    },
    {
      name: 'Record Noise Audio',
      path: '/citizen/noise-evidence',
      icon: Mic,
      badge: 'Min 10s',
      badgeColor: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    },
    {
      name: 'Hotspot Map',
      path: '/hotspots',
      icon: MapPin,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Submit Full Complaint',
      path: '/complaints',
      icon: FileWarning,
      badge: unverifiedComplaintsCount > 0 ? `${unverifiedComplaintsCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      name: 'Air Quality Info',
      path: '/air-quality',
      icon: Wind,
      badge: activeAlertCount > 0 ? `${activeAlertCount} Alert` : null,
      badgeColor: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
    },
    {
      name: 'Noise Monitoring Info',
      path: '/noise-monitoring',
      icon: Volume2,
      badge: 'CORTN',
      badgeColor: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    },
  ];

  const officerNavItems = [
    {
      name: 'Command Center',
      path: '/officer',
      icon: Shield,
      badge: 'CPCB',
      badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },
    {
      name: 'Air Surveillance (LSTM)',
      path: '/air-quality',
      icon: Wind,
      badge: activeAlertCount > 0 ? `${activeAlertCount} Alert` : null,
      badgeColor: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
    },
    {
      name: 'Noise Surveillance (CORTN)',
      path: '/noise-monitoring',
      icon: Volume2,
      badge: 'CORTN AI',
      badgeColor: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    },
    {
      name: 'Hotspot Cluster Map',
      path: '/hotspots',
      icon: MapPin,
      badge: 'DBSCAN',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Citizen Incident Triage',
      path: '/complaints',
      icon: FileWarning,
      badge: `${complaints.length}`,
      badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      name: 'Analytics & Models',
      path: '/analytics',
      icon: BarChart3,
      badge: 'LSTM/CNN',
      badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },
    {
      name: 'AI Reports & Dossier',
      path: '/reports',
      icon: Sparkles,
      badge: 'LLM Agent',
      badgeColor: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
  ];

  const currentNavItems = activePortal === 'officer' ? officerNavItems : citizenNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-teal-300/30">
              <Radio className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">SmartPoll</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">SIH 2026 · Team Carpe diem</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Mode Switcher Toggle */}
        <div className="px-4 pt-4">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center">
            <button
              onClick={() => setActivePortal('citizen')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activePortal === 'citizen'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Citizen View</span>
            </button>

            <button
              onClick={() => setActivePortal('officer')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activePortal === 'officer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Officer View</span>
            </button>
          </div>
        </div>

        {/* NITK & Team Banner */}
        <div className="mx-4 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-900 dark:text-slate-200">NIT Surathkal</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Intelligent Environmental Monitoring</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {activePortal === 'officer' ? 'Authority Command Grid' : 'Citizen Participation Hub'}
          </p>

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Quick Theme Selector in Sidebar */}
          <div className="pt-3 px-1 border-t border-slate-100 dark:border-slate-800">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Theme Mode
            </p>
            <div className="grid grid-cols-2 gap-1 px-1">
              <button
                onClick={() => setTheme('clean-light')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-left flex items-center space-x-1.5 ${
                  theme === 'clean-light'
                    ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Clean Light</span>
              </button>

              <button
                onClick={() => setTheme('dark-slate')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-left flex items-center space-x-1.5 ${
                  theme === 'dark-slate'
                    ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>Slate Dark</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Live Telemetry Status Footer */}
        <div className="p-3.5 m-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-300 text-[11px]">AI Model Consensus</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/50">
              Active
            </span>
          </div>
          <div className="text-[10px] text-slate-500 space-y-0.5">
            <div className="flex justify-between">
              <span>Air Forecaster:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">WVPBL-BiLSTM</span>
            </div>
            <div className="flex justify-between">
              <span>Noise Sensor:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">CORTN + ResNet</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
