/**
 * Air Quality API Service
 * Connects to the PranaAI backend gateway at /api/*
 * (proxied to http://localhost:8000 in dev via vite.config.ts)
 */

const BASE = "/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ForecastResponse {
  status: string;
  location: { city: string; lat: number; lon: number };
  data_source: string;
  current: {
    cpcb_aqi: number;
    category: string;
    color: string;
    bg_color: string;
    prominent_pollutant: string;
    prominent_pollutant_display: string;
    sub_indices: Record<string, number>;
    concentrations: Record<string, number>;
  };
  forecast_summary: {
    peak_aqi: number;
    peak_hour: string;
    peak_reason: string;
    min_aqi: number;
    trend: string;
  };
  hourly_forecast: Array<{
    hour?: number;
    label?: string;
    cpcb_aqi?: number;
    aqi?: number;
    category?: string;
    pm2_5?: number;
    pm25?: number;
    pm10?: number;
    [key: string]: unknown;
  }>;
  series: {
    hours: string[];
    aqi: number[];
    pm2_5: number[];
    pm10: number[];
  };
  health_advisory: Record<string, unknown>;
}

export interface ReportResponse {
  status: string;
  city: string;
  report_markdown: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  models_loaded: boolean;
  version: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

/**
 * Fetch 24-hour AQI forecast for a city.
 */
export async function fetchForecast(city: string): Promise<ForecastResponse> {
  const res = await fetch(`${BASE}/forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Forecast API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Generate the 15-section AI Municipal Environmental Intelligence Report.
 */
export async function generateReport(city: string): Promise<ReportResponse> {
  const res = await fetch(`${BASE}/generate-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Report API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch the list of supported Indian cities.
 */
export async function fetchCities(): Promise<{
  total: number;
  cities: Array<{ name: string; lat: number; lon: number; state: string }>;
}> {
  const res = await fetch(`${BASE}/cities`);
  if (!res.ok) throw new Error(`Cities API error: ${res.status}`);
  return res.json();
}

/**
 * Check backend health.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}
