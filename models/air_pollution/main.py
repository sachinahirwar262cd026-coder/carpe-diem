"""
PranaAI India Air Quality Intelligence API — ML Microservice (port 8001).

Endpoints:
  GET  /api/health
  GET  /api/cities
  GET  /api/current
  POST /api/forecast
  POST /api/generate-report
  GET  /api/model-info
  GET  /api/cpcb-scale
  POST /api/noise/classify-sound
  GET  /api/noise/sound-taxonomy
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse

from cpcb_engine import calculate_cpcb_naqi, calculate_sub_index, AQI_CATEGORIES, CPCB_BREAKPOINTS
from data_fetcher import (
    INDIAN_CITIES,
    FEATURES,
    get_48h_history,
    get_default_api_key
)
from health_advisor import get_health_advisory
from models import HybridEnsembleForecaster

# ── App init ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PranaAI India Air Quality Intelligence API",
    description="CPCB-compliant AQI engine, 24-hour Bi-LSTM forecast, and AI report generation.",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load ML forecaster ────────────────────────────────────────────────────────
forecaster = HybridEnsembleForecaster(model_dir="saved_models")
forecaster.load_or_initialize()

# ── Static dashboard (legacy standalone UI) ───────────────────────────────────
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# ── Pydantic schemas ──────────────────────────────────────────────────────────
class ForecastRequest(BaseModel):
    city: Optional[str] = Field(None, description="Indian city name")
    lat: Optional[float] = Field(None)
    lon: Optional[float] = Field(None)
    api_key: Optional[str] = Field(None, description="OpenWeatherMap API key")


class ReportRequest(BaseModel):
    city: Optional[str] = Field("Delhi", description="Indian city name")
    api_key: Optional[str] = Field(None, description="OpenWeatherMap API key")
    groq_api_key: Optional[str] = Field(None, description="Groq API key")


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse(
        "<h2>PranaAI Air Quality ML Microservice is running. "
        "<a href='/docs'>API Docs →</a></h2>"
    )


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PranaAI India Air Quality Forecasting Engine",
        "models_loaded": forecaster.is_loaded,
        "version": "3.0.0",
    }


# ── Cities ────────────────────────────────────────────────────────────────────
@app.get("/api/cities")
async def get_cities():
    return {
        "total": len(INDIAN_CITIES),
        "cities": [
            {"name": name, "lat": m["lat"], "lon": m["lon"],
             "state": m["state"], "tier": m["tier"], "region": m["region"]}
            for name, m in INDIAN_CITIES.items()
        ],
    }


# ── Current AQI (GET) ─────────────────────────────────────────────────────────
@app.get("/api/current")
async def get_current_aqi(
    city: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    api_key: Optional[str] = Query(None),
):
    if city and city in INDIAN_CITIES:
        lat, lon = INDIAN_CITIES[city]["lat"], INDIAN_CITIES[city]["lon"]
    elif lat is None or lon is None:
        lat, lon = 28.6139, 77.2090

    seq, latest_comp, source = get_48h_history(lat, lon, api_key)
    cpcb = calculate_cpcb_naqi(latest_comp)

    return {
        "location": {"city": city or f"({lat}, {lon})", "lat": lat, "lon": lon},
        "data_source": source,
        "cpcb_aqi": cpcb["aqi"],
        "category": cpcb["category"],
        "color": cpcb["color"],
        "prominent_pollutant": cpcb["prominent_pollutant"],
        "sub_indices": cpcb.get("sub_indices", {}),
        "concentrations": latest_comp,
    }


# ── Forecast (POST) ───────────────────────────────────────────────────────────
@app.post("/api/forecast")
async def predict_forecast(req: ForecastRequest):
    target_city = req.city
    lat, lon = req.lat, req.lon

    if target_city and target_city in INDIAN_CITIES:
        lat = INDIAN_CITIES[target_city]["lat"]
        lon = INDIAN_CITIES[target_city]["lon"]
    elif lat is None or lon is None:
        target_city = "Delhi"
        lat, lon = 28.6139, 77.2090

    try:
        seq_48x9, latest_comp, data_source = get_48h_history(lat, lon, req.api_key)
        current_cpcb = calculate_cpcb_naqi(latest_comp)
        forecast_output = forecaster.predict_24h(seq_48x9)
        health_info = get_health_advisory(
            aqi=current_cpcb["aqi"],
            prominent_pollutant=current_cpcb["prominent_pollutant"],
            peak_hour_info={
                "peak_aqi": forecast_output["summary"]["peak_aqi"],
                "peak_hour": forecast_output["summary"]["peak_hour"],
                "reason": forecast_output["summary"]["peak_reason"],
            },
        )
        return {
            "status": "success",
            "location": {
                "city": target_city or f"({lat:.4f}, {lon:.4f})",
                "lat": lat,
                "lon": lon,
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
                    k: round(float(latest_comp.get(k, 0.0)), 1)
                    for k in ["pm2_5", "pm10", "no2", "so2", "co", "o3", "nh3"]
                },
            },
            "forecast_summary": forecast_output["summary"],
            "hourly_forecast": forecast_output["hourly_records"],
            "series": forecast_output["series"],
            "health_advisory": health_info,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


# ── AI Report (POST) ──────────────────────────────────────────────────────────
@app.post("/api/generate-report")
async def generate_report_endpoint(req: ReportRequest):
    """
    Generate a 15-section Official Municipal Environmental Intelligence Report
    using live telemetry + Groq LLM (direct API, no LangChain required).
    """
    try:
        from report_generation import generate_report
        city = req.city or "Delhi"
        report_md = generate_report(
            city=city,
            api_key=req.api_key,
            groq_key=req.groq_api_key,
        )
        return {
            "status": "success",
            "city": city,
            "report_markdown": report_md,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")


# ── CORTN Noise Prediction ───────────────────────────────────────────────────
from cortn_engine import calculate_cortn_noise, generate_diurnal_24h_noise, get_city_corridor_predictions

class CortnRequest(BaseModel):
    vehicles_per_hour: float = Field(2400.0, description="Vehicles per hour (Q)")
    mean_speed_kmph: float = Field(35.0, description="Mean traffic speed in km/h (V)")
    heavy_vehicle_pct: float = Field(18.0, description="Heavy commercial vehicle percentage (p)")
    road_gradient_pct: Optional[float] = Field(0.0, description="Road gradient percentage (G)")
    surface_type: Optional[str] = Field("asphalt", description="Road surface type: asphalt, concrete, porous, cobblestone")
    distance_meters: Optional[float] = Field(13.5, description="Distance to receiver in meters (d)")
    zone_type: Optional[str] = Field("commercial", description="CPCB Zone: industrial, commercial, residential, silence")
    is_night: Optional[bool] = Field(False, description="Is nighttime evaluation")

@app.post("/api/noise/cortn-predict")
async def cortn_predict(req: CortnRequest):
    """
    Execute standard CORTN (Calculation of Road Traffic Noise) mathematical modeling.
    Returns L10, Leq, Lmax, CPCB limit violation, and step-by-step mathematical breakdown.
    """
    try:
        result = calculate_cortn_noise(
            vehicles_per_hour=req.vehicles_per_hour,
            mean_speed_kmph=req.mean_speed_kmph,
            heavy_vehicle_pct=req.heavy_vehicle_pct,
            road_gradient_pct=req.road_gradient_pct or 0.0,
            surface_type=req.surface_type or "asphalt",
            distance_meters=req.distance_meters or 13.5,
            zone_type=req.zone_type or "commercial",
            is_night=req.is_night or False,
        )
        return {"status": "success", "prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CORTN prediction error: {str(e)}")

@app.get("/api/noise/live-telemetry")
async def get_live_noise_telemetry(city: str = Query("Delhi", description="City name")):
    """
    Ingests live traffic telemetry (fleet speed, flow, congestion %, freight ratio)
    and executes CORTN mathematical acoustic modeling.
    """
    try:
        from cortn_engine import fetch_live_traffic_telemetry
        data = fetch_live_traffic_telemetry(city)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Live noise telemetry error: {str(e)}")

@app.get("/api/noise/city-corridors")
async def get_city_corridors_noise(city: str = Query("Delhi", description="City name")):
    """
    Returns major arterial road corridors evaluated with CORTN math + 24-hour diurnal noise curve.
    """
    try:
        corridors = get_city_corridor_predictions(city)
        diurnal = generate_diurnal_24h_noise(
            base_q=3400 if city.lower() in ("delhi", "mumbai", "bengaluru") else 2800,
            base_v=32,
            base_p=18,
            zone_type="commercial"
        )
        return {
            "status": "success",
            "city": city,
            "corridors": corridors,
            "diurnal_24h": diurnal,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"City noise corridors error: {str(e)}")


# ── Sound Classification (CNN / MobileNetV2) ──────────────────────────────────
from sound_classifier import predict as cnn_predict, get_taxonomy as cnn_taxonomy


@app.post("/api/noise/classify-sound")
async def classify_sound(
    file: UploadFile = File(..., description="Mel-spectrogram image (PNG or JPEG)")
):
    """
    Accept a Mel-spectrogram image from the frontend, run MobileNetV2 CNN
    inference, and return the main sound category + sub-label + confidence.

    Main categories:
      Traffic | Environmental | Industrial | Human_Activity | Construction

    Sub-labels (examples):
      car_horn, engine, siren, train, helicopter (Traffic)
      rain, sea_waves, crackling_fire … (Environmental)
      chainsaw, drilling, vacuum_cleaner … (Industrial)
      clapping, coughing, crying_baby … (Human_Activity)
      jackhammer, glass_breaking, fireworks … (Construction)
    """
    allowed_types = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{file.content_type}'. Send PNG or JPEG spectrogram."
        )

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file received.")

    result = cnn_predict(image_bytes)
    return result


@app.get("/api/noise/sound-taxonomy")
async def get_sound_taxonomy():
    """
    Returns the full ESC-50 taxonomy: main categories and their sub-labels,
    plus which classes the CNN was actually trained on.
    """
    return cnn_taxonomy()

# ── Model info ────────────────────────────────────────────────────────────────
@app.get("/api/model-info")
async def get_model_info():
    meta_path = os.path.join("saved_models", "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            return json.load(f)
    return {
        "model_name": "Hybrid Attention Bi-LSTM + LightGBM Ensemble",
        "version": "3.0.0",
        "features": FEATURES,
        "input_window_hours": 48,
        "forecast_horizon_hours": 24,
        "cpcb_standard_compliant": True,
        "is_loaded": forecaster.is_loaded,
    }


# ── CPCB scale ────────────────────────────────────────────────────────────────
@app.get("/api/cpcb-scale")
async def get_cpcb_scale():
    return {
        "standards_body": "Central Pollution Control Board (CPCB), Govt. of India",
        "categories": AQI_CATEGORIES,
        "breakpoints": CPCB_BREAKPOINTS,
    }

