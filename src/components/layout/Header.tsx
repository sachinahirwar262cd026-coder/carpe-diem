import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Activity,
  User,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  MapPin,
  RefreshCw,
  LogOut,
  Shield,
  Phone,
  Mail,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getAqiBadgeStyle, getAqiCategory } from '../../utils/helpers';
import { ThemeSelector } from '../common/ThemeSelector';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    cities,
    selectedCity,
    setSelectedCityId,
    liveUpdatesEnabled,
    setLiveUpdatesEnabled,
    lastUpdated,
    activeAlertCount,
  } = useApp();

  const { user, logout, activePortal, setActivePortal } = useAuth();
  const navigate = useNavigate();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const aqiBadge = getAqiBadgeStyle(getAqiCategory(selectedCity.currentAqi));

  // Compute initials (e.g. "Dr. Anjali Sharma" -> "AS", "Lokesh Satiwada" -> "LS")
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const cleanName = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
    const parts = cleanName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left section: Hamburger & City Switcher */}
      <div className="flex items-center space-x-3 lg:space-x-6">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic City Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition text-sm font-medium shadow-sm"
          >
            <MapPin className="w-4 h-4 text-teal-400" />
            <span className="font-semibold">{selectedCity.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${aqiBadge.bg} ${aqiBadge.text} ${aqiBadge.border}`}>
              AQI {selectedCity.currentAqi}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCityDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsCityDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Select Monitoring Region
                </p>
                {cities.map((city) => {
                  const badge = getAqiBadgeStyle(getAqiCategory(city.currentAqi));
                  const isSelected = city.id === selectedCity.id;
                  return (
                    <button
                      key={city.id}
                      onClick={() => {
                        setSelectedCityId(city.id);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                        isSelected ? 'bg-teal-500/10 border border-teal-500/30 text-white' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center space-x-1.5">
                          <span>{city.name}</span>
                          {city.id === 'mangalore-nitk' && (
                            <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1 py-0.2 rounded font-mono">
                              NITK
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{city.state} · {city.pockets.length} micro-pockets</p>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {city.currentAqi} AQI
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Quick Weather pill for large screens */}
        <div className="hidden xl:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
          <span>{selectedCity.weather.condition}</span>
          <span className="text-slate-600">•</span>
          <span>{selectedCity.weather.temp}°C</span>
          <span className="text-slate-600">•</span>
          <span>Wind: {selectedCity.weather.windSpeed} km/h {selectedCity.weather.windDirection}</span>
        </div>
      </div>

      {/* Right section: Portal Toggle, Theme Selector, Live Pulse toggle, Notifications & Profile */}
      <div className="flex items-center space-x-2 lg:space-x-3">
        {/* Portal Switcher Pill (Desktop) */}
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setActivePortal('citizen');
              navigate('/citizen');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activePortal === 'citizen'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Citizen</span>
          </button>

          <button
            onClick={() => {
              setActivePortal('officer');
              navigate('/officer');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activePortal === 'officer'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Officer</span>
          </button>
        </div>

        {/* Theme Selector */}
        <ThemeSelector />

        {/* Live Stream / Simulation toggle */}
        <button
          onClick={() => setLiveUpdatesEnabled(!liveUpdatesEnabled)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            liveUpdatesEnabled
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Toggle live telemetry stream simulation"
        >
          <Activity className={`w-3.5 h-3.5 ${liveUpdatesEnabled ? 'animate-pulse text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">{liveUpdatesEnabled ? 'Live Telemetry' : 'Paused'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition"
            aria-label="Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {activeAlertCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-slate-100">Live Environmental Alerts</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Updated {lastUpdated}</span>
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {selectedCity.currentAqi > 200 && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                      <div className="flex items-center justify-between text-rose-400 font-bold mb-1">
                        <span>Asthma & Respiratory Alert</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/20 rounded">Critical</span>
                      </div>
                      <p className="text-slate-300">
                        {selectedCity.name} AQI is {selectedCity.currentAqi} ({selectedCity.category}). Asthmatic patients should avoid morning exertion.
                      </p>
                    </div>
                  )}

                  {selectedCity.currentNoise > 75 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                        <span>Acoustic Threshold Exceeded</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 rounded">Traffic Alert</span>
                      </div>
                      <p className="text-slate-300">
                        Average street decibels at {selectedCity.currentNoise} dB(A). CORTN model detects high congestion honking.
                      </p>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs">
                    <div className="flex items-center justify-between text-teal-400 font-bold mb-1">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Forecast Available</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-teal-500/20 rounded">BiLSTM</span>
                    </div>
                    <p className="text-slate-300">
                      24-hour predictive trend computed for all {selectedCity.pockets.length} micro-pockets in {selectedCity.name}.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User / Officer Profile Section with Dropdown & Logout */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2.5 pl-2 py-1 pr-2 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/80 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 via-emerald-500 to-indigo-600 p-[1.5px] shadow-sm">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-teal-300 font-black text-xs">
                  {getInitials(user.name)}
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[130px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-teal-400/90 font-medium truncate max-w-[130px]">
                  {user.role}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Header */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 mb-2">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{user.name}</h4>
                        <span className="text-[10px] font-semibold text-teal-400 font-mono">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <div className="flex items-center space-x-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>+91 {user.mobile}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Logout */}
                  <div className="space-y-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out of Session</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow-md shadow-teal-500/20"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
