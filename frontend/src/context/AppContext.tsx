import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  CityData,
  CitizenComplaint,
  MicroPocket,
  NoiseHotspot,
  AppTheme,
} from "../types";
import { INITIAL_MOCK_COMPLAINTS } from "../data/mockComplaints";
import { fetchCities } from "../services/api/airQualityService";
import { useAuth } from "./AuthContext";
import {
  backendComplaintToFrontend,
  fetchMyComplaintsApi,
  updateComplaintStatusApi,
} from "../services/api/complaintService";
import { fetchCityNoiseCorridors } from "../services/api/noiseService";

const fallbackCity = (
  name = "Delhi NCR",
  state = "Delhi",
  lat = 28.6139,
  lon = 77.209,
): CityData => ({
  id: (name || "city").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  state,
  center: [lat, lon],
  zoom: 12,
  currentAqi: 0,
  currentNoise: 0,
  category: "Moderate",
  primaryPollutant: "PM2.5",
  weather: {
    temp: 26,
    humidity: 58,
    windSpeed: 6,
    windDirection: "NW",
    condition: "Monitoring",
  },
  pockets: [
    {
      id: `${(name || "city").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-center`,
      name: `${name} Center`,
      city: name,
      zone: "Central Zone",
      aqi: 0,
      category: "Moderate",
      dominantPollutant: "PM2.5",
      noiseDb: 0,
      temperature: 26,
      humidity: 58,
      windSpeed: 6,
      windDirection: "NW",
      cpcbStationDistance: "Live feed",
      lat,
      lng: lon,
      isHotspot: false,
      activeComplaints: 0,
    },
  ],
});

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
  addComplaint: (
    newComplaint: Omit<
      CitizenComplaint,
      "id" | "trackingNumber" | "timestamp" | "status" | "citizenCredibility"
    >,
  ) => CitizenComplaint;
  addPersistedComplaint: (complaint: CitizenComplaint) => void;
  resolveComplaint: (id: string) => Promise<void>;
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

const normalizeCityId = (name: string, index: number) => {
  const slug = (name || "city")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.includes("delhi")) return "delhi";
  if (slug.includes("bengaluru") || slug.includes("bangalore"))
    return "bengaluru";
  if (slug.includes("mumbai")) return "mumbai";
  if (slug.includes("mangaluru") || slug.includes("surathkal"))
    return "mangalore-nitk";
  if (slug.includes("pune")) return "pune";
  if (slug.includes("nagpur")) return "nagpur";
  if (slug.includes("chennai")) return "chennai";

  return slug || `city-${index}`;
};

const matchesCityId = (cityId: string, targetId: string) => {
  if (!targetId) return false;
  const normalizedCityId = cityId.toLowerCase();
  const normalizedTarget = targetId.toLowerCase();
  return (
    normalizedCityId === normalizedTarget ||
    normalizedCityId.startsWith(`${normalizedTarget}-`) ||
    normalizedTarget.startsWith(`${normalizedCityId}-`)
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token } = useAuth();
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("app_theme");
    return (saved as AppTheme) || "dark-slate";
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("app_theme", newTheme);
  };

  useEffect(() => {
    const isDark =
      theme === "dark-slate" ||
      theme === "deep-forest" ||
      theme === "cyber-neon" ||
      (theme as string) === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      document.body.classList.remove("theme-clean-light");
      document.body.classList.add("theme-dark-slate");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.body.classList.remove("theme-dark-slate");
      document.body.classList.add("theme-clean-light");
    }
  }, [theme]);

  const [cities, setCities] = useState<CityData[]>([fallbackCity()]);
  const [selectedCityId, setSelectedCityIdState] = useState<string>("");
  const [userGpsLocation, setUserGpsLocation] = useState<UserGpsInfo | null>(
    null,
  );
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [noiseHotspots, setNoiseHotspots] = useState<NoiseHotspot[]>([]);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState<boolean>(true);
  const [liveTick, setLiveTick] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    if (!token || token.startsWith("demo-token-")) {
      setComplaints(INITIAL_MOCK_COMPLAINTS);
      return () => {
        mounted = false;
      };
    }

    fetchMyComplaintsApi(token)
      .then((response) => {
        if (!mounted) return;
        const loaded = response.data.complaints.map((complaint) =>
          backendComplaintToFrontend(complaint, user?.name),
        );
        setComplaints(loaded);
      })
      .catch((error) => {
        if (mounted) {
          console.error("Failed to load complaints:", error);
          setComplaints([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [token, user?.name]);

  useEffect(() => {
    let mounted = true;
    fetchCities()
      .then((data) => {
        if (!mounted) return;
        const cityList: CityData[] = data.cities.map((city, index) => ({
          ...fallbackCity(city.name, city.state, city.lat, city.lon),
          id: normalizeCityId(city.name, index),
          currentAqi: 0,
          currentNoise: 0,
          category: "Moderate",
          weather: {
            temp: 26,
            humidity: 58,
            windSpeed: 6,
            windDirection: "NW",
            condition: "Monitoring",
          },
          pockets: [
            {
              ...fallbackCity(city.name, city.state, city.lat, city.lon)
                .pockets[0],
              id: `${normalizeCityId(city.name, index)}-center-${index}`,
              city: city.name,
              zone: "City Centre",
            },
          ],
        }));
        setCities(cityList.length ? cityList : [fallbackCity()]);
        setSelectedCityIdState((prev) => prev || cityList[0]?.id || "delhi");
      })
      .catch(() => {
        if (!mounted) return;
        setCities([fallbackCity()]);
        setSelectedCityIdState("delhi");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setSelectedCityId = (id: string) => {
    const target = (id || "").trim();
    if (!target) return;

    const directMatch = cities.find(
      (c) => c.id === target || c.name.toLowerCase() === target.toLowerCase(),
    );
    if (directMatch) {
      setSelectedCityIdState(directMatch.id);
      return;
    }

    const bySlug = cities.find((c) => matchesCityId(c.id, target));
    if (bySlug) {
      setSelectedCityIdState(bySlug.id);
      return;
    }

    setSelectedCityIdState(target);
  };

  const selectedCity = useMemo(() => {
    const match =
      cities.find(
        (c) =>
          c.id === selectedCityId ||
          c.name.toLowerCase() === selectedCityId.toLowerCase() ||
          matchesCityId(c.id, selectedCityId),
      ) ||
      cities.find((c) =>
        c.name.toLowerCase().includes(selectedCityId.toLowerCase()),
      ) ||
      cities[0] ||
      fallbackCity();

    return match;
  }, [cities, selectedCityId]);

  useEffect(() => {
    let mounted = true;
    const city = selectedCity.name;

    fetchCityNoiseCorridors(city).then((response) => {
      if (!mounted) return;
      const hotspots: NoiseHotspot[] = response.corridors.map(
        (corridor, index) => {
          const angle =
            (index / Math.max(response.corridors.length, 1)) * Math.PI * 2;
          const radius = 0.012 + (index % 2) * 0.006;
          const severity = corridor.severity;
          return {
            id: `${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-noise-${index}`,
            name: corridor.name,
            city,
            lat: selectedCity.center[0] + Math.cos(angle) * radius,
            lng: selectedCity.center[1] + Math.sin(angle) * radius,
            currentDb: Number(corridor.l_eq || 0),
            peakDb: Number(corridor.l_max || corridor.l_eq || 0),
            zoneType:
              corridor.zone === "silence"
                ? "Silence"
                : corridor.zone === "industrial"
                  ? "Industrial"
                  : corridor.zone === "residential"
                    ? "Residential"
                    : "Commercial",
            standardLimit: Number(corridor.cpcb_limit || 0),
            violationAmount: Number(corridor.violation || 0),
            primarySource: "Traffic Congestion",
            trafficSpeedKmph: Number(corridor.speed_kmph || 0),
            vehicleDensity:
              corridor.traffic_flow > 4000
                ? "Very High"
                : corridor.traffic_flow > 2500
                  ? "High"
                  : "Moderate",
            aiConfidence: 97,
            status: severity === "good" ? "Mitigated" : "Active",
            recentComplaintsCount: 0,
          };
        },
      );
      setNoiseHotspots(hotspots);
    });

    return () => {
      mounted = false;
    };
  }, [selectedCity]);

  const [selectedPocket, setSelectedPocket] = useState<MicroPocket | null>(
    null,
  );

  // Default selected pocket when city changes
  useEffect(() => {
    if (
      selectedCity &&
      selectedCity.pockets &&
      selectedCity.pockets.length > 0
    ) {
      setSelectedPocket(selectedCity.pockets[0]);
    }
  }, [selectedCity]);

  // Live simulation tick
  useEffect(() => {
    if (!liveUpdatesEnabled) return;
    const interval = setInterval(() => {
      setLiveTick((prev) => prev + 1);
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [liveUpdatesEnabled]);

  const addComplaint = (
    data: Omit<
      CitizenComplaint,
      "id" | "trackingNumber" | "timestamp" | "status" | "citizenCredibility"
    >,
  ): CitizenComplaint => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const cityCode = data.city.includes("Delhi")
      ? "DL"
      : data.city.includes("Bengaluru")
        ? "KA"
        : data.city.includes("Mumbai")
          ? "MH"
          : "IN";
    const trackingNumber = `SIH-2026-${cityCode}-${randomNum}`;

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace("T", " ");

    const newComplaint: CitizenComplaint = {
      ...data,
      id: `cmp-${Date.now()}`,
      trackingNumber,
      timestamp,
      status: "Verified Hotspot",
      citizenCredibility: 94,
    };

    setComplaints((prev) => {
      const updated = [newComplaint, ...prev];
      try {
        localStorage.setItem("citizen_complaints", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    return newComplaint;
  };

  const addPersistedComplaint = (complaint: CitizenComplaint) => {
    setComplaints((prev) => {
      const updated = [
        complaint,
        ...prev.filter((item) => item.id !== complaint.id),
      ];
      try {
        localStorage.setItem("citizen_complaints", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resolveComplaint = async (id: string) => {
    if (token && !token.startsWith("demo-token-")) {
      await updateComplaintStatusApi(id, "resolved", token);
    }

    setComplaints((prev) => {
      const updated = prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Resolved" as const,
              actionTaken: "Resolved by Citizen",
            }
          : c,
      );
      try {
        localStorage.setItem("citizen_complaints", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => [...prev, id]);
  };

  const activeAlertCount = useMemo(() => {
    let count = 0;
    if (
      selectedCity.currentAqi > 200 &&
      !dismissedAlerts.includes("asthma-alert")
    )
      count++;
    if (
      selectedCity.currentNoise > 75 &&
      !dismissedAlerts.includes("noise-alert")
    )
      count++;
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
        addPersistedComplaint,
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
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
