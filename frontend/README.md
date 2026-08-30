# Intelligent Air and Noise Pollution Monitoring and Prediction
### Smart India Hackathon 2026 · Problem Statement Solution
**Presented by Team Carpe diem — National Institute of Technology Surathkal (NITK)**

---

## 🌟 Overview & Concept

Our system provides an end-to-end intelligent platform addressing both **Air Pollution** and **Noise Pollution** in urban centers. Built using multi-sensor data fusion, deep learning forecasting (LSTM/BiLSTM), kinematic traffic-to-noise models (CORTN), citizen crowdsourcing with Mel-spectrogram acoustic analysis (CNN), geospatial hotspot clustering (DBSCAN), and an LLM Decision Support Agent for Municipal and Pollution Control Authorities.

---

## 👥 Team Carpe diem (NIT Surathkal)
- **Sachin Ahirwar**
- **Aditi Kange**
- **Prathmesh Kolekar**
- **Sura Varsha**
- **Prateek Jaiswal**
- **Lokesh Satiwada**

---

## 🚀 Key Modules & Capabilities

1. **Air Quality Intelligence & Forecasting (`/air-quality`)**
   - Live CPCB Ground Truth + OpenWeather API telemetry data fusion.
   - 24-Hour hourly micro-pocket AQI predictions with confidence bounds powered by **WVPBL-BiLSTM**.
   - Comprehensive multi-pollutant breakdown ($PM_{2.5}, PM_{10}, NO_2, CO, SO_2, O_3$) with NAAQS limit meters.
   - Micro-pocket selector (Delhi NCR, Bengaluru, Mumbai, NITK Surathkal / Mangalore).
   - Medical advisories for the **30 million+ Indian asthma patients** trapped by citywide average blind spots.

2. **Noise Surveillance & Acoustic AI (`/noise-monitoring`)**
   - **CORTN Traffic-to-Noise Engine**: Computes street decibels ($dB(A)$) from vehicular speeds, traffic volume, and road surfaces without expensive street microphones.
   - Interactive CORTN physics parameter simulator.
   - **Mel-Spectrogram 2D Heatmap & ResNet CNN Classifier**: Analyzes citizen audio evidence to classify pressure horns, hydraulic jackhammers, and amplified loudspeakers with confidence scores.
   - CPCB ambient Day & Night noise standards guide across Residential, Commercial, Industrial, and Silence Zones.

3. **Interactive Hotspot Geospatial Map (`/hotspots`)**
   - Multi-layer Leaflet map with custom SVG markers and dynamic heat pulses.
   - Layer toggles for Air Quality Pockets, Noise Decibel Hotspots, and Citizen Evidence Pins.
   - Interactive spatial inspector drawer for micro-pocket telemetry.

4. **Citizen Participation & Evidence Submission (`/complaints`)**
   - Dual-domain complaint reporting (Air / Noise / Both).
   - Interactive live microphone recording simulator with waveform visualizer and Mel-spectrogram AI pre-analysis.
   - Photo evidence attachment with automated smoke plume / diesel generator recognition.
   - GPS micro-location tagging and Citizen Credibility scoring (0–100).
   - Instant tracking reference ID generation and status workflow timeline.

5. **Analytics & Research Benchmarks (`/analytics`)**
   - 7-Day longitudinal ground truth vs. predicted AQI trajectories.
   - Diurnal traffic speed vs. decibel level correlation curves.
   - Multi-pollutant radar fingerprint comparison across city micro-pockets.
   - Machine Learning research performance metrics (LSTM, BiLSTM, CORTN, CNN, DBSCAN accuracy, $R^2$, MAE, RMSE).

6. **LLM Environmental Decision Support (`/reports`)**
   - Autonomous environmental synthesis for Municipal Corporations and State Pollution Control Boards (CPCB/SPCB).
   - Prioritized authority intervention matrix with responsible departments, timeframe, and expected impact.
   - Official SIH Government Environmental Action Dossier with print preview and JSON export.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 with custom modern environmental gradients & animations
- **Routing**: React Router DOM v6
- **Data Visualization**: Recharts (ComposedChart, AreaChart, LineChart, BarChart, RadarChart)
- **Geospatial Mapping**: Leaflet & React-Leaflet with custom interactive SVG DivIcons
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

---

## 💻 How to Run the Project

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application will start on `http://localhost:5173`. Open this URL in your web browser.

### 3. Build for Production
```bash
npm run build
```
This generates optimized static files in the `dist/` directory.

### 4. Preview the Production Build
```bash
npm run preview
```

---

## 📁 Project Architecture

```
SIH-Frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── types/           # Strong TypeScript domain definitions
    ├── data/            # Realistic data fusion & research mock datasets
    ├── context/         # Global AppContext with live simulation tick
    ├── utils/           # Helper calculations, AQI badges & standards
    ├── components/
    │   ├── layout/      # Sidebar, Header, Footer, AppLayout
    │   ├── common/      # StatCard, GaugeChart, AlertBanner
    │   ├── aqi/         # AqiHeroCard, PollutantGrid, Forecast24HourChart, AsthmaAdvisory, MicroPocketTable
    │   ├── noise/       # NoiseHeroCard, TrafficNoiseEstimator, SpectrogramViewer, NoiseStandardsGuide
    │   ├── map/         # InteractiveLeafletMap, MapFilterControls
    │   ├── complaints/  # ComplaintForm, AudioRecorderSim, ComplaintCard, ComplaintSuccessModal
    │   ├── analytics/   # AqiTrendAnalytics, NoiseTrendAnalytics, PollutantRadarChart, ModelPerformanceCard
    │   └── reports/     # AiExecutiveSummary, PrioritizedActionsTable, GovernmentReportModal
    ├── pages/           # 7 full-featured navigable pages
    ├── App.tsx          # React Router setup
    ├── main.tsx         # Root mounting
    └── index.css        # Tailwind & custom scrollbar/leaflet styling
```
