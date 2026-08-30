"""
India Air Quality Forecasting & Intelligence API.

Combines:
- Official Central Pollution Control Board (CPCB) NAQI calculation engine
- Real-time atmospheric telemetry ingestion (OpenWeatherMap + Open-Meteo)
- Deep Learning Temporal Attention Seq2Seq Bi-LSTM 24-hour pollutant forecaster
- Machine Learning LightGBM Multi-horizon Residual Calibrator
- Graduated Response Action Plan (GRAP) Health Guidance Engine
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse

from cpcb_engine import calculate_cpcb_naqi, calculate_sub_index, AQI_CATEGORIES, CPCB_BREAKPOINTS
from data_fetcher import (
    INDIAN_CITIES,
    FEATURES,
    get_48h_history,
    get_default_api_key
)
from health_advisor import get_health_advisory, get_persona_advisory
from models import HybridEnsembleForecaster

# Initialize FastAPI Application
app = FastAPI(
    title="India Air Quality Intelligence & Forecasting API",
    description="CPCB-compliant Indian Air Quality Index calculation, multi-pollutant monitoring, and Deep Learning 24-hour forecasting microservice.",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Machine Learning Forecaster
forecaster = HybridEnsembleForecaster(model_dir="saved_models")
forecaster.load_or_initialize()

# Mount Static Dashboard Assets
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# Pydantic Schemas
class ForecastRequest(BaseModel):
    city: Optional[str] = Field(None, description="Name of Indian city (e.g., Delhi, Mumbai, Bengaluru)")
    lat: Optional[float] = Field(None, description="Custom latitude coordinate")
    lon: Optional[float] = Field(None, description="Custom longitude coordinate")
    api_key: Optional[str] = Field(None, description="Optional OpenWeatherMap API Key (defaults to free Open-Meteo if absent)")


class SubIndicesResponse(BaseModel):
    pm2_5: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    nh3: Optional[float] = None


@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    """Serves the interactive Air Quality Intelligence Glassmorphic Dashboard."""
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse("<h2>Air Quality API is running. Access docs at <a href='/docs'>/docs</a></h2>")


@app.get("/api/health")
async def health_check():
    """Service health and model load state."""
    return {
        "status": "healthy",
        "service": "India Air Quality Forecasting Engine",
        "models_loaded": forecaster.is_loaded,
        "version": "2.4.0"
    }


@app.get("/api/cities")
async def get_cities():
    """Returns database of major Indian cities with coordinates and climate regions."""
    cities_list = []
    for city_name, meta in INDIAN_CITIES.items():
        cities_list.append({
            "name": city_name,
            "lat": meta["lat"],
            "lon": meta["lon"],
            "state": meta["state"],
            "tier": meta["tier"],
            "region": meta["region"]
        })
    return {"total": len(cities_list), "cities": cities_list}


@app.post("/api/forecast")
async def predict_forecast(req: ForecastRequest):
    """
    Computes real-time & 24-hour ahead Air Quality and pollutant forecast
    for ANY coordinate or city across India.
    """
    # Resolve Latitude and Longitude
    target_city = req.city
    lat, lon = req.lat, req.lon

    if target_city and target_city in INDIAN_CITIES:
        lat = INDIAN_CITIES[target_city]["lat"]
        lon = INDIAN_CITIES[target_city]["lon"]
    elif lat is None or lon is None:
        # Default fallback to New Delhi
        target_city = "Delhi"
        lat = 28.6139
        lon = 77.2090

    try:
        # 1. Fetch 48-Hour Historical Sequence
        seq_48x9, latest_comp, data_source = get_48h_history(lat, lon, req.api_key)

        # 2. Evaluate Current CPCB AQI
        current_cpcb = calculate_cpcb_naqi(latest_comp)

        # 3. Generate 24-Hour ML Multi-Step Forecast
        forecast_output = forecaster.predict_24h(seq_48x9)

        # 4. Generate Persona Health Advisory & GRAP Triggers
        health_info = get_health_advisory(
            aqi=current_cpcb["aqi"],
            prominent_pollutant=current_cpcb["prominent_pollutant"],
            peak_hour_info={
                "peak_aqi": forecast_output["summary"]["peak_aqi"],
                "peak_hour": forecast_output["summary"]["peak_hour"],
                "reason": forecast_output["summary"]["peak_reason"]
            }
        )

        return {
            "status": "success",
            "location": {
                "city": target_city or f"Coordinates ({lat:.4f}, {lon:.4f})",
                "lat": lat,
                "lon": lon
            },
            "data_source": data_source,
            "current": {
                "cpcb_aqi": current_cpcb["aqi"],
                "category": current_cpcb["category"],
                "color": current_cpcb["color"],
                "bg_color": current_cpcb["bg_color"],
                "prominent_pollutant": current_cpcb["prominent_pollutant"],
                "prominent_pollutant_display": current_cpcb["prominent_pollutant_display"],
                "sub_indices": current_cpcb["sub_indices"],
                "concentrations": {
                    "pm2_5": round(latest_comp.get("pm2_5", 0.0), 1),
                    "pm10": round(latest_comp.get("pm10", 0.0), 1),
                    "no2": round(latest_comp.get("no2", 0.0), 1),
                    "so2": round(latest_comp.get("so2", 0.0), 1),
                    "co": round(latest_comp.get("co", 0.0), 1),
                    "o3": round(latest_comp.get("o3", 0.0), 1),
                    "nh3": round(latest_comp.get("nh3", 0.0), 1)
                }
            },
            "forecast_summary": forecast_output["summary"],
            "hourly_forecast": forecast_output["hourly_records"],
            "series": forecast_output["series"],
            "health_advisory": health_info
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/api/current")
async def get_current_aqi(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    api_key: Optional[str] = Query(None, description="API Key")
):
    """Fetches real-time air quality telemetry and Indian CPCB evaluation."""
    if city and city in INDIAN_CITIES:
        lat = INDIAN_CITIES[city]["lat"]
        lon = INDIAN_CITIES[city]["lon"]
    elif lat is None or lon is None:
        lat = 28.6139
        lon = 77.2090

    seq_48x9, latest_comp, data_source = get_48h_history(lat, lon, api_key)
    current_cpcb = calculate_cpcb_naqi(latest_comp)

    return {
        "location": {"city": city or f"({lat}, {lon})", "lat": lat, "lon": lon},
        "data_source": data_source,
        "cpcb_aqi": current_cpcb["aqi"],
        "category": current_cpcb["category"],
        "color": current_cpcb["color"],
        "prominent_pollutant": current_cpcb["prominent_pollutant"],
        "sub_indices": current_cpcb["sub_indices"],
        "concentrations": latest_comp
    }


@app.get("/api/model-info")
async def get_model_info():
    """Returns deep ML architecture specifications and training benchmark metrics."""
    meta_path = os.path.join("saved_models", "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            metadata = json.load(f)
            return metadata
            
    return {
        "model_name": "Hybrid Attention Bi-LSTM + LightGBM Ensemble",
        "version": "3.0.0",
        "architecture": "Bidirectional LSTM (64, 32) + Temporal Attention + RepeatVector + Decoder Bi-GRU (32) + TimeDistributed Dense",
        "features": FEATURES,
        "input_window_hours": 48,
        "forecast_horizon_hours": 24,
        "cpcb_standard_compliant": True,
        "is_loaded": forecaster.is_loaded
    }


@app.get("/api/cpcb-scale")
async def get_cpcb_scale():
    """Returns official Indian CPCB NAQI breakpoints and category definitions."""
    return {
        "standards_body": "Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change, Govt. of India",
        "categories": AQI_CATEGORIES,
        "breakpoints": CPCB_BREAKPOINTS
    }
