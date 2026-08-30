# Carpe Diem — Multi-Domain AI Platform

A comprehensive, multi-tiered AI platform for real-time Air Quality Index (AQI) monitoring, 24-hour neural forecasting, and CPCB-standard health intelligence.

---

## 📁 Repository Structure

```text
carpe-diem/
│
├── frontend/                       # Client-side Dashboard & UI (React / Next.js / Web)
│   └── README.md
│
├── backend/                        # Server-side Business Logic & API Gateway
│   └── README.md
│
└── models/                         # Machine Learning & Deep Learning Core
    └── air_pollution/              # Air Quality Forecasting Microservice
        ├── saved_models/           # Trained Attention Bi-LSTM & LightGBM weights
        ├── static/                 # Standalone Glassmorphic UI Dashboard
        ├── main.py                 # FastAPI REST Server
        ├── models.py               # Attention Bi-LSTM Neural Architecture
        ├── cpcb_engine.py          # Official Indian NAQI piecewise linear calculator
        ├── data_fetcher.py         # Atmospheric ingestion (Open-Meteo + OWM)
        ├── health_advisor.py       # GRAP action plan & health advisories
        ├── train_v2.py             # Multi-city 2-year training pipeline
        ├── run_server.py           # One-click microservice launcher
        └── requirements.txt        # Python dependencies
```

---

## 🚀 Quick Start (Running the Air Pollution Model)

1. Navigate to the `models/air_pollution` directory:
   ```bash
   cd models/air_pollution
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server & dashboard:
   ```bash
   python run_server.py
   ```

4. Access the service:
   - **Interactive Dashboard:** `http://localhost:8000`
   - **Swagger API Docs:** `http://localhost:8000/docs`
   - **Forecast API:** `POST http://localhost:8000/api/forecast`
