# Backend Module

This directory is reserved for the primary backend application (e.g. Node.js, Express, Django, FastAPI gateway, database orchestration, and authentication).

### Interfacing with the ML Microservice:
- The ML engine runs standalone from `models/` on port `8000`.
- Proxy requests or query `http://localhost:8000/api/forecast` to fetch real-time CPCB AQI and 24-hour deep learning forecasts.
