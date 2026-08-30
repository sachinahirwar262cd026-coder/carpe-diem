import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  MapPin,
  LogOut,
  Crosshair,
  User,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocode } from '../../services/api/geocodingService';
import { getAqiBadgeStyle, getAqiCategory } from '../../utils/helpers';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    cities,
    selectedCity,
    setSelectedCityId,
    setUserGpsLocation,
    theme,
    setTheme,
  } = useApp();

  const { user, logout } = useAuth();
  const geo = useGeolocation(false);
  const [gpsDetecting, setGpsDetecting] = useState<boolean>(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const isDark = theme === 'dark-slate' || theme === 'deep-forest' || theme === 'cyber-neon' || (theme as string) === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'clean-light' : 'dark-slate');
  };

  const handleHeaderDetectGps = async () => {
    setGpsDetecting(true);
    try {
      const pos = await geo.getPosition();
      const geoInfo = await reverseGeocode(pos.lat, pos.lng);
      setUserGpsLocation({
        lat: pos.lat,
        lng: pos.lng,
        accuracy: pos.accuracy,
        placeName: geoInfo.displayName,
      });
      if (geoInfo.nearestMonitoredCityId) {
        setSelectedCityId(geoInfo.nearestMonitoredCityId);
      }
    } catch {
      // Ignored if user cancels
    } finally {
      setGpsDetecting(false);
    }
  };

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
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Menu Trigger + Live Location City Selector */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Location / City Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center space-x-2 sm:space-x-3 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 transition text-xs sm:text-sm font-medium shadow-xs"
          >
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-teal-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-[180px]">
                {selectedCity.name}
              </span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${aqiBadge.bg} ${aqiBadge.text} ${aqiBadge.border}`}>
              AQI {selectedCity.currentAqi}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCityDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsCityDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Select Monitoring Location
                  </span>
                  <button
                    type="button"
                    onClick={handleHeaderDetectGps}
                    disabled={gpsDetecting}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-teal-400 hover:underline flex items-center space-x-1 transition disabled:opacity-50"
                  >
                    <Crosshair className={`w-3 h-3 ${gpsDetecting ? 'animate-spin' : ''}`} />
                    <span>{gpsDetecting ? 'Locating...' : 'GPS Auto-Detect'}</span>
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar pr-1">
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
                          isSelected
                            ? 'bg-emerald-50 dark:bg-teal-500/15 border border-emerald-200 dark:border-teal-500/40 text-emerald-900 dark:text-white font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400 shrink-0" />}
                          <div className="truncate">
                            <span className="truncate">{city.name}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">{city.state}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}>
                          {city.currentAqi} AQI
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Light/Dark Theme Switch + User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 transition"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* User Profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2.5 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition"
              aria-label="User Profile"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {getInitials(user.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-teal-400 font-medium truncate max-w-[120px]">
                  {user.role || 'Officer / Citizen'}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-teal-500/20 text-emerald-700 dark:text-teal-400 border border-emerald-200 dark:border-teal-500/30 flex items-center justify-center font-bold text-xs">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email || 'user@prana.ai'}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};
