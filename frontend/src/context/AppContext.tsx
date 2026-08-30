import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CityData, CitizenComplaint, MicroPocket, NoiseHotspot, AppTheme } from '../types';
import { CITIES_DATA } from '../data/mockAqiData';
import { INITIAL_MOCK_COMPLAINTS } from '../data/mockComplaints';
import { MOCK_NOISE_HOTSPOTS } from '../data/mockNoiseData';

interface AppContextType {
  cities: CityData[];
  selectedCity: CityData;
  setSelectedCityId: (id: string) => void;
  selectedPocket: MicroPocket | null;
  setSelectedPocket: (pocket: MicroPocket | null) => void;
  complaints: CitizenComplaint[];
  addComplaint: (newComplaint: Omit<CitizenComplaint, 'id' | 'trackingNumber' | 'timestamp' | 'status' | 'citizenCredibility'>) => CitizenComplaint;
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
  const [theme, setTheme] = useState<AppTheme>('clean-light');
  const [cities] = useState<CityData[]>(CITIES_DATA);
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(INITIAL_MOCK_COMPLAINTS);
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

  // Live simulation tick every 6 seconds to show dynamic system behavior
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
    const cityCode = data.city.includes('Delhi') ? 'DL' : data.city.includes('Bengaluru') ? 'KA' : data.city.includes('Mumbai') ? 'MH' : 'KT';
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

    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
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
        complaints,
        addComplaint,
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
