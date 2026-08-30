import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CityData, CitizenComplaint, MicroPocket, NoiseHotspot, AppTheme } from '../types';
import { CITIES_DATA } from '../data/mockAqiData';
import { INITIAL_MOCK_COMPLAINTS } from '../data/mockComplaints';
import { MOCK_NOISE_HOTSPOTS } from '../data/mockNoiseData';

export interface UserGpsInfo {
  lat: number;
  lng: number;
  accuracy: number;
  placeName: string;
}

interface AppContextType {
  cities: CityData[];
  selectedCity: CityData;
  setSelectedCityId: (id: string) => void;
  selectedPocket: MicroPocket | null;
  setSelectedPocket: (pocket: MicroPocket | null) => void;
  userGpsLocation: UserGpsInfo | null;
  setUserGpsLocation: (loc: UserGpsInfo | null) => void;
  complaints: CitizenComplaint[];
  addComplaint: (newComplaint: Omit<CitizenComplaint, 'id' | 'trackingNumber' | 'timestamp' | 'status' | 'citizenCredibility'>) => CitizenComplaint;
  resolveComplaint: (id: string) => void;
  noiseHotspots: NoiseHotspot[];
  liveUpdatesEnabled: boolean;
  setLiveUpdatesEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  liveTick: number;
  lastUpdated: string;
  activeAlertCount: number;
  dismissAlert: (id: string) => void;
  dismissedAlerts: string[];
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as AppTheme) || 'dark-slate';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };

  useEffect(() => {
    const isDark = theme === 'dark-slate' || theme === 'deep-forest' || theme === 'cyber-neon' || (theme as string) === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.classList.remove('theme-clean-light');
      document.body.classList.add('theme-dark-slate');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.classList.remove('theme-dark-slate');
      document.body.classList.add('theme-clean-light');
    }
  }, [theme]);

  const [cities] = useState<CityData[]>(CITIES_DATA);
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');
  const [userGpsLocation, setUserGpsLocation] = useState<UserGpsInfo | null>(null);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(() => {
    try {
      const saved = localStorage.getItem('citizen_complaints');
      return saved ? JSON.parse(saved) : INITIAL_MOCK_COMPLAINTS;
    } catch {
      return INITIAL_MOCK_COMPLAINTS;
    }
  });
  const [noiseHotspots] = useState<NoiseHotspot[]>(MOCK_NOISE_HOTSPOTS);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState<boolean>(true);
  const [liveTick, setLiveTick] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const selectedCity = useMemo(() => {
    return cities.find((c) => c.id === selectedCityId) || cities[0];
  }, [cities, selectedCityId]);

  const [selectedPocket, setSelectedPocket] = useState<MicroPocket | null>(null);

  // Default selected pocket when city changes
  useEffect(() => {
    if (selectedCity && selectedCity.pockets.length > 0) {
      setSelectedPocket(selectedCity.pockets[0]);
    }
  }, [selectedCity]);

  // Live simulation tick
  useEffect(() => {
    if (!liveUpdatesEnabled) return;
    const interval = setInterval(() => {
      setLiveTick((prev) => prev + 1);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 6000);
    return () => clearInterval(interval);
  }, [liveUpdatesEnabled]);

  const addComplaint = (
    data: Omit<CitizenComplaint, 'id' | 'trackingNumber' | 'timestamp' | 'status' | 'citizenCredibility'>
  ): CitizenComplaint => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const cityCode = data.city.includes('Delhi') ? 'DL' : data.city.includes('Bengaluru') ? 'KA' : data.city.includes('Mumbai') ? 'MH' : 'IN';
    const trackingNumber = `SIH-2026-${cityCode}-${randomNum}`;
    
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');

    const newComplaint: CitizenComplaint = {
      ...data,
      id: `cmp-${Date.now()}`,
      trackingNumber,
      timestamp,
      status: 'Verified Hotspot',
      citizenCredibility: 94,
    };

    setComplaints((prev) => {
      const updated = [newComplaint, ...prev];
      try {
        localStorage.setItem('citizen_complaints', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    return newComplaint;
  };

  const resolveComplaint = (id: string) => {
    setComplaints((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, status: 'Resolved' as const, actionTaken: 'Resolved by Citizen' } : c
      );
      try {
        localStorage.setItem('citizen_complaints', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => [...prev, id]);
  };

  const activeAlertCount = useMemo(() => {
    let count = 0;
    if (selectedCity.currentAqi > 200 && !dismissedAlerts.includes('asthma-alert')) count++;
    if (selectedCity.currentNoise > 75 && !dismissedAlerts.includes('noise-alert')) count++;
    return count;
  }, [selectedCity, dismissedAlerts]);

  return (
    <AppContext.Provider
      value={{
        cities,
        selectedCity,
        setSelectedCityId,
        selectedPocket,
        setSelectedPocket,
        userGpsLocation,
        setUserGpsLocation,
        complaints,
        addComplaint,
        resolveComplaint,
        noiseHotspots,
        liveUpdatesEnabled,
        setLiveUpdatesEnabled,
        liveTick,
        lastUpdated,
        activeAlertCount,
        dismissAlert,
        dismissedAlerts,
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
