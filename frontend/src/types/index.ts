export type AppTheme = 'dark-slate' | 'clean-light' | 'deep-forest' | 'cyber-neon';

export type PortalRole = 'citizen' | 'officer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'CPCB Officer / Analyst' | 'Municipal Enforcement' | 'Verified Citizen' | 'Researcher';
  organization?: string;
  citizenCredibility?: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AirAnalysisResult {
  id: string;
  timestamp: string;
  location: string;
  severity: 'Normal' | 'Moderate' | 'Unhealthy' | 'Critical';
  aqiImpact: string;
  estimatedAqi: number;
  primaryPollutant: string;
  confidenceScore: number;
  detectedSource: string;
  summaryExplanation: string;
  healthImpact: string;
  recommendedActionCitizen: string;
  recommendedActionAuthority: string;
  imageUrl: string;
  status: 'Analyzed' | 'Submitted as Complaint' | 'Dispatched';
}

export interface NoiseAnalysisResult {
  id: string;
  timestamp: string;
  location: string;
  durationSeconds: number;
  estimatedIntensityDb: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  detectedSource: string;
  confidenceScore: number;
  summaryExplanation: string;
  permissibleLimit: number;
  violationMarginDb: number;
  spectralPeaks: string;
  recommendedActionCitizen: string;
  recommendedActionAuthority: string;
  status: 'Analyzed' | 'Submitted as Complaint' | 'Dispatched';
  frequencyGraph: { freq: string; amplitude: number }[];
}

export type AqiCategory = 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | 'Hazardous';

export interface Pollutant {
  name: string;
  chemical: string;
  value: number;
  unit: string;
  standard: number;
  status: 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  percentage: number;
  description: string;
}

export interface HourlyForecast {
  time: string;
  hour: number;
  aqi: number;
  category: AqiCategory;
  pm25: number;
  pm10: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  confidenceLower: number;
  confidenceUpper: number;
}

export interface MicroPocket {
  id: string;
  name: string;
  city: string;
  zone: string;
  aqi: number;
  category: AqiCategory;
  dominantPollutant: string;
  noiseDb: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  cpcbStationDistance: string;
  lat: number;
  lng: number;
  isHotspot: boolean;
  activeComplaints: number;
}

export interface CityData {
  id: string;
  name: string;
  state: string;
  center: [number, number];
  zoom: number;
  currentAqi: number;
  currentNoise: number;
  category: AqiCategory;
  primaryPollutant: string;
  weather: {
    temp: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    condition: string;
  };
  pockets: MicroPocket[];
}

export interface NoiseHotspot {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  currentDb: number;
  peakDb: number;
  zoneType: 'Residential' | 'Commercial' | 'Industrial' | 'Silence';
  standardLimit: number;
  violationAmount: number;
  primarySource: 'Traffic Congestion' | 'Construction' | 'Industrial Machinery' | 'Loudspeakers/Events' | 'Commercial Hub';
  trafficSpeedKmph: number;
  vehicleDensity: 'High' | 'Very High' | 'Moderate' | 'Low';
  aiConfidence: number;
  status: 'Active' | 'Investigating' | 'Mitigated';
  recentComplaintsCount: number;
}

export interface CitizenComplaint {
  id: string;
  trackingNumber: string;
  type: 'air' | 'noise' | 'both';
  title: string;
  description: string;
  locationName: string;
  city: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: 'Pending AI Review' | 'Verified Hotspot' | 'Action Dispatched' | 'Resolved';
  citizenName: string;
  citizenCredibility: number;
  aiVerification: {
    confidence: number;
    estimatedIntensity: string; // e.g. "86 dB(A) - Heavy Traffic" or "PM2.5 ~ 180 µg/m³ - Smoke Plume"
    detectedSource: string;
    spectrogramAnalyzed?: boolean;
    imageRecognized?: boolean;
    urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  };
  evidenceType: 'audio' | 'photo' | 'both' | 'text';
  audioDurationSec?: number;
  imageUrl?: string;
  actionTaken?: string;
}

export interface AiRecommendation {
  id: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  targetType: 'Air Quality' | 'Noise Reduction' | 'Combined Action';
  location: string;
  city: string;
  problemStatement: string;
  modelConfidence: number;
  recommendedAction: string;
  authorityResponsible: 'Traffic Police' | 'Municipal Corp' | 'State Pollution Control Board' | 'Public Works Dept (PWD)';
  estimatedImpact: string;
  timeframe: 'Immediate (< 2 hrs)' | 'Short Term (24-48 hrs)' | 'Long Term (1-2 weeks)';
  status: 'Pending Dispatch' | 'In Progress' | 'Completed';
}

export interface ModelMetric {
  name: string;
  architecture: string;
  purpose: string;
  accuracy: string;
  mae: number;
  rmse: number;
  r2: number;
  trainingDataset: string;
  inferenceSpeed: string;
  status: 'Online / Active' | 'Optimal';
}
