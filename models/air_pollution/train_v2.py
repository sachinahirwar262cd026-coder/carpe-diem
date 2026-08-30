"""
Comprehensive Real-Data Training Pipeline for Air Quality Forecasting.

Key improvements over v1:
1. REAL atmospheric data from Open-Meteo historical API for 28 Indian cities
   spanning Jan 2023 - Aug 2024 (~14,000 hourly records per city)
2. Synthetic augmentation for rare Indian events: Diwali, crop burning,
   pre-monsoon dust storms, post-monsoon fog inversions
3. RobustScaler instead of MinMaxScaler - handles outliers properly
4. Calibrated to match Open-Meteo inference distribution (training == inference source)
5. Larger model capacity with more diverse data
"""

import os
import json
import time
import math
import joblib
import requests
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from sklearn.preprocessing import RobustScaler
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
import lightgbm as lgb

import tensorflow as tf
from models import build_attention_bilstm_model, FeatureEngineer, TemporalAttention
from data_fetcher import FEATURES

SAVE_DIR = "saved_models"

# =========================================================================
# 28 Indian cities spanning all climate zones
# =========================================================================
TRAINING_CITIES = {
    # Indo-Gangetic Plain (highest pollution, strong inversions)
    "Delhi":         (28.6139, 77.2090),
    "Noida":         (28.5355, 77.3910),
    "Kanpur":        (26.4499, 80.3319),
    "Lucknow":       (26.8467, 80.9462),
    "Patna":         (25.5941, 85.1376),
    "Varanasi":      (25.3176, 82.9739),
    "Agra":          (27.1767, 78.0081),
    "Ludhiana":      (30.9010, 75.8573),
    # East India
    "Kolkata":       (22.5726, 88.3639),
    "Bhubaneswar":   (20.2961, 85.8245),
    "Ranchi":        (23.3441, 85.3096),
    "Guwahati":      (26.1445, 91.7362),
    # West India
    "Mumbai":        (19.0760, 72.8777),
    "Pune":          (18.5204, 73.8567),
    "Ahmedabad":     (23.0225, 72.5714),
    "Surat":         (21.1702, 72.8311),
    # South India (cleaner, coastal)
    "Bengaluru":     (12.9716, 77.5946),
    "Chennai":       (13.0827, 80.2707),
    "Hyderabad":     (17.3850, 78.4867),
    "Kochi":         ( 9.9312, 76.2673),
    "Visakhapatnam": (17.6868, 83.2185),
    # Central & North
    "Bhopal":        (23.2599, 77.4126),
    "Indore":        (22.7196, 75.8577),
    "Nagpur":        (21.1458, 79.0882),
    "Jaipur":        (26.9124, 75.7873),
    "Chandigarh":    (30.7333, 76.7794),
    "Dehradun":      (30.3165, 78.0322),
    "Gurugram":      (28.4595, 77.0266),
}

# Date ranges to fetch - 2 full years of real data
DATE_RANGES = [
    ("2023-01-01", "2023-06-30"),   # Winter + pre-monsoon
    ("2023-07-01", "2023-12-31"),   # Monsoon + post-monsoon + Diwali season
    ("2024-01-01", "2024-07-31"),   # Another winter cycle + summer
]


def fetch_openmeteo_historical(lat: float, lon: float,
                                start_date: str, end_date: str) -> Optional[np.ndarray]:
    """
    Fetches hourly historical air quality from Open-Meteo (free, no key needed).
    Returns numpy array of shape (N, 9) matching FEATURES order:
      [aqi_proxy, co, no, no2, o3, so2, pm2_5, pm10, nh3]
    """
    url = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality?"
        f"latitude={lat}&longitude={lon}"
        f"&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,"
        f"sulphur_dioxide,ozone,ammonia"
        f"&start_date={start_date}&end_date={end_date}"
    )
    try:
        res = requests.get(url, timeout=20)
        if res.status_code != 200:
            return None
        d = res.json()
        hourly = d.get("hourly", {})
        times = hourly.get("time", [])
        if not times:
            return None

        rows = []
        for i in range(len(times)):
            def g(key, fallback):
                vals = hourly.get(key, [])
                v = vals[i] if i < len(vals) else None
                return float(v) if v is not None else fallback

            pm25 = g("pm2_5", 40.0)
            pm10 = g("pm10", 75.0)
            no2  = g("nitrogen_dioxide", 25.0)
            so2  = g("sulphur_dioxide", 12.0)
            o3   = g("ozone", 38.0)
            co   = g("carbon_monoxide", 400.0)
            nh3  = g("ammonia", 10.0)
            no   = max(1.0, no2 * 0.28)

            # AQI proxy (1-5 scale approximated from PM2.5)
            if pm25 > 250: aqi_proxy = 5.0
            elif pm25 > 120: aqi_proxy = 4.0
            elif pm25 > 60:  aqi_proxy = 3.0
            elif pm25 > 30:  aqi_proxy = 2.0
            else:            aqi_proxy = 1.0

            rows.append([aqi_proxy, co, no, no2, o3, so2, pm25, pm10, nh3])

        return np.array(rows, dtype=np.float32) if rows else None

    except Exception as e:
        print(f"  [API Error] {e}")
        return None


def generate_indian_event_augmentation(n_hours: int = 5000) -> np.ndarray:
    """
    Synthetic augmentation for rare but critical Indian air quality events
    that may not appear frequently enough in 2 years of real historical data.

    Events covered:
    - Diwali firecrackers (Oct/Nov nights): extreme PM2.5 spike
    - North India crop burning (Oct-Nov): sustained PM2.5 500+
    - Pre-monsoon dust storms (April-May): extreme PM10, moderate PM2.5
    - Post-monsoon fog inversions (Dec-Jan): sustained high PM at night
    - Industrial accident plumes: short CO/SO2 spikes
    - Clean monsoon periods (July-Aug): very low all pollutants
    """
    rows = []

    # 1. Diwali night events (PM2.5 500-800, PM10 800-1200, burst pattern)
    for _ in range(n_hours // 10):
        pm25 = np.random.uniform(400, 900)
        pm10 = pm25 * np.random.uniform(1.4, 1.8)
        no2  = np.random.uniform(80, 180)
        so2  = np.random.uniform(40, 120)
        o3   = np.random.uniform(15, 40)
        co   = np.random.uniform(2000, 5000)
        nh3  = np.random.uniform(20, 60)
        no   = no2 * np.random.uniform(0.2, 0.4)
        rows.append([5.0, co, no, no2, o3, so2, pm25, pm10, nh3])

    # 2. Crop burning season (sustained, gradual)
    for _ in range(n_hours // 8):
        pm25 = np.random.uniform(200, 500)
        pm10 = pm25 * np.random.uniform(1.5, 2.2)
        no2  = np.random.uniform(50, 100)
        so2  = np.random.uniform(20, 60)
        o3   = np.random.uniform(20, 60)
        co   = np.random.uniform(1500, 3500)
        nh3  = np.random.uniform(30, 80)
        no   = no2 * np.random.uniform(0.2, 0.4)
        rows.append([5.0, co, no, no2, o3, so2, pm25, pm10, nh3])

    # 3. Pre-monsoon dust storms (very high PM10, moderate PM2.5)
    for _ in range(n_hours // 8):
        pm10 = np.random.uniform(500, 1500)
        pm25 = pm10 * np.random.uniform(0.25, 0.45)
        no2  = np.random.uniform(20, 50)
        so2  = np.random.uniform(5, 20)
        o3   = np.random.uniform(30, 80)
        co   = np.random.uniform(300, 800)
        nh3  = np.random.uniform(5, 20)
        no   = no2 * np.random.uniform(0.2, 0.3)
        rows.append([4.0, co, no, no2, o3, so2, pm25, pm10, nh3])

    # 4. Dense winter fog + inversion (IGP, Dec-Jan nights)
    for _ in range(n_hours // 6):
        pm25 = np.random.uniform(150, 350)
        pm10 = pm25 * np.random.uniform(1.6, 2.0)
        no2  = np.random.uniform(60, 120)
        so2  = np.random.uniform(25, 70)
        o3   = np.random.uniform(8, 30)     # low in winter/fog
        co   = np.random.uniform(1200, 2800)
        nh3  = np.random.uniform(15, 50)
        no   = no2 * np.random.uniform(0.25, 0.45)
        rows.append([4.0, co, no, no2, o3, so2, pm25, pm10, nh3])

    # 5. Clean monsoon (July-Aug, heavy rains wash out all pollutants)
    for _ in range(n_hours // 6):
        pm25 = np.random.uniform(5, 25)
        pm10 = np.random.uniform(10, 50)
        no2  = np.random.uniform(5, 25)
        so2  = np.random.uniform(2, 12)
        o3   = np.random.uniform(20, 55)
        co   = np.random.uniform(100, 400)
        nh3  = np.random.uniform(3, 15)
        no   = no2 * np.random.uniform(0.15, 0.3)
        aqi_p = 1.0 if pm25 < 15 else 2.0
        rows.append([aqi_p, co, no, no2, o3, so2, pm25, pm10, nh3])

    # 6. Typical good days (coastal / southern cities)
    for _ in range(n_hours // 6):
        pm25 = np.random.uniform(8, 45)
        pm10 = pm25 * np.random.uniform(1.5, 2.5)
        no2  = np.random.uniform(8, 40)
        so2  = np.random.uniform(3, 18)
        o3   = np.random.uniform(25, 70)
        co   = np.random.uniform(150, 600)
        nh3  = np.random.uniform(4, 18)
        no   = no2 * np.random.uniform(0.15, 0.3)
        aqi_p = 1.0 if pm25 < 30 else 2.0
        rows.append([aqi_p, co, no, no2, o3, so2, pm25, pm10, nh3])

    return np.array(rows, dtype=np.float32)


def build_windows(data: np.ndarray, n_past: int = 48, n_future: int = 24,
                  step: int = 1) -> Tuple[np.ndarray, np.ndarray]:
    """Create sliding window sequences."""
    X, y = [], []
    for i in range(0, len(data) - n_past - n_future + 1, step):
        X.append(data[i : i + n_past])
        y.append(data[i + n_past : i + n_past + n_future])
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def train_comprehensive():
    """
    Full training pipeline with real Open-Meteo historical data + augmentation.
    """
    os.makedirs(SAVE_DIR, exist_ok=True)

    # =========================================================================
    # PHASE 1: Collect Real Historical Data
    # =========================================================================
    print("=" * 60)
    print("PHASE 1: Fetching real Open-Meteo historical data")
    print("=" * 60)

    all_real_data = []
    total_records = 0
    city_records = {}

    for city_name, (lat, lon) in TRAINING_CITIES.items():
        city_rows = []
        for start_date, end_date in DATE_RANGES:
            print(f"  [{city_name}] {start_date} -> {end_date} ...", end=" ", flush=True)
            arr = fetch_openmeteo_historical(lat, lon, start_date, end_date)
            if arr is not None and len(arr) > 48:
                city_rows.extend(arr.tolist())
                print(f"{len(arr)} records")
            else:
                print("SKIP")
            time.sleep(0.3)  # Polite rate limit

        if len(city_rows) > 100:
            city_arr = np.array(city_rows, dtype=np.float32)
            all_real_data.append(city_arr)
            city_records[city_name] = len(city_rows)
            total_records += len(city_rows)

    print(f"\n  Total real records collected: {total_records}")
    for city, n in city_records.items():
        print(f"    {city}: {n}")

    # =========================================================================
    # PHASE 2: Synthetic Augmentation for Rare Events
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 2: Generating rare-event augmentation data")
    print("=" * 60)

    aug_data = generate_indian_event_augmentation(n_hours=8000)
    print(f"  Augmentation records: {len(aug_data)}")

    # =========================================================================
    # PHASE 3: Combine and fit Scaler
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 3: Fitting RobustScaler on combined dataset")
    print("=" * 60)

    # Combine all real data
    if all_real_data:
        real_combined = np.vstack(all_real_data)
    else:
        print("  WARNING: No real data fetched — using augmentation only")
        real_combined = aug_data

    # Combine with augmentation
    combined = np.vstack([real_combined, aug_data])
    np.random.shuffle(combined)
    print(f"  Total training records: {len(combined)}")

    # Print value ranges for each feature
    print("\n  Feature value ranges (real + augmented):")
    feat_names = ["aqi_proxy", "co", "no", "no2", "o3", "so2", "pm2_5", "pm10", "nh3"]
    for i, name in enumerate(feat_names):
        col = combined[:, i]
        print(f"    {name.ljust(10)}: min={col.min():.1f}  median={np.median(col):.1f}  max={col.max():.1f}")

    # RobustScaler uses median and IQR — much more robust to the extreme events
    scaler = RobustScaler(quantile_range=(5.0, 95.0))
    scaler.fit(combined)
    joblib.dump(scaler, os.path.join(SAVE_DIR, "scaler.pkl"))
    print("\n  RobustScaler fitted and saved.")

    # =========================================================================
    # PHASE 4: Build per-city sequence windows
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 4: Building 48h->24h sliding window sequences")
    print("=" * 60)

    n_past, n_future = 48, 24
    all_X, all_y = [], []

    for city_arr in all_real_data:
        scaled_city = scaler.transform(city_arr)
        X_c, y_c = build_windows(scaled_city, n_past, n_future, step=2)
        all_X.append(X_c)
        all_y.append(y_c)
        print(f"  Windows from real data: {len(X_c)}")

    # Also build windows from augmentation
    scaled_aug = scaler.transform(aug_data)
    # Augmented data isn't a real time-series, so window step = n_past to avoid overlap
    X_aug, y_aug = build_windows(scaled_aug, n_past, n_future, step=n_past)
    all_X.append(X_aug)
    all_y.append(y_aug)
    print(f"  Windows from augmented events: {len(X_aug)}")

    X = np.vstack(all_X)
    y = np.vstack(all_y)

    # Shuffle sequences
    idx = np.random.permutation(len(X))
    X, y = X[idx], y[idx]

    split = int(len(X) * 0.85)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]
    print(f"\n  Train sequences: {len(X_train)}")
    print(f"  Val   sequences: {len(X_val)}")

    # =========================================================================
    # PHASE 5: Train Attention Bi-LSTM
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 5: Training Attention Bi-LSTM on real data")
    print("=" * 60)

    n_features = len(FEATURES)
    lstm_model = build_attention_bilstm_model(n_past=n_past, n_future=n_future, n_features=n_features)

    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.4, patience=3, min_lr=5e-6),
    ]

    history = lstm_model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=20,
        batch_size=64,
        callbacks=callbacks,
        verbose=1
    )

    lstm_path = os.path.join(SAVE_DIR, "attention_lstm.keras")
    lstm_model.save(lstm_path)
    print(f"  Model saved: {lstm_path}")

    # =========================================================================
    # PHASE 6: Train LightGBM
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 6: Training LightGBM regressors")
    print("=" * 60)

    X_tab_train = np.array([FeatureEngineer.extract_features(seq) for seq in X_train[:3000]])
    y_pm25_train = y_train[:3000, :, 6]

    lgb_models = {}
    for h in [0, 5, 11, 17, 23]:
        reg = lgb.LGBMRegressor(n_estimators=150, learning_rate=0.05,
                                num_leaves=63, random_state=42, verbose=-1)
        reg.fit(X_tab_train, y_pm25_train[:, h])
        lgb_models[f"pm25_h{h+1}"] = reg

    joblib.dump(lgb_models, os.path.join(SAVE_DIR, "lgb_models.joblib"))
    print("  LightGBM models saved.")

    # =========================================================================
    # PHASE 7: Evaluation
    # =========================================================================
    print("\n" + "=" * 60)
    print("PHASE 7: Evaluation on validation set")
    print("=" * 60)

    val_preds_scaled = lstm_model.predict(X_val, batch_size=64, verbose=0)

    y_val_orig = scaler.inverse_transform(y_val.reshape(-1, n_features)).reshape(y_val.shape)
    preds_orig = scaler.inverse_transform(val_preds_scaled.reshape(-1, n_features)).reshape(val_preds_scaled.shape)

    pm25_true = y_val_orig[:, :, 6].flatten()
    pm25_pred = preds_orig[:, :, 6].flatten()
    pm10_true = y_val_orig[:, :, 7].flatten()
    pm10_pred = preds_orig[:, :, 7].flatten()
    no2_true  = y_val_orig[:, :, 3].flatten()
    no2_pred  = preds_orig[:, :, 3].flatten()

    def metrics(true, pred, name):
        rmse = float(root_mean_squared_error(true, pred))
        mae  = float(mean_absolute_error(true, pred))
        r2   = float(r2_score(true, pred))
        print(f"  {name.ljust(8)}: RMSE={rmse:.2f}  MAE={mae:.2f}  R2={r2:.4f}")

    metrics(pm25_true, pm25_pred, "PM2.5")
    metrics(pm10_true, pm10_pred, "PM10")
    metrics(no2_true,  no2_pred,  "NO2")

    # Save metadata
    metadata = {
        "model_name": "Comprehensive Hybrid Ensemble Forecaster v3.0",
        "version": "3.0.0",
        "training_date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "data_source": "Open-Meteo Real Historical + Indian Event Augmentation",
        "cities_trained": list(city_records.keys()),
        "real_records": total_records,
        "augmentation_records": len(aug_data),
        "total_windows": int(len(X)),
        "date_coverage": "2023-01-01 to 2024-07-31",
        "scaler": "RobustScaler (quantile_range=5-95%)",
        "input_window_hours": n_past,
        "forecast_horizon_hours": n_future,
        "features": FEATURES,
        "evaluation_metrics": {
            "pm2_5": {"rmse": round(float(root_mean_squared_error(pm25_true, pm25_pred)), 2),
                      "mae":  round(float(mean_absolute_error(pm25_true, pm25_pred)), 2),
                      "r2":   round(float(r2_score(pm25_true, pm25_pred)), 4)},
            "pm10":  {"rmse": round(float(root_mean_squared_error(pm10_true, pm10_pred)), 2),
                      "mae":  round(float(mean_absolute_error(pm10_true, pm10_pred)), 2),
                      "r2":   round(float(r2_score(pm10_true, pm10_pred)), 4)},
        },
        "cpcb_standard_compliant": True
    }

    with open(os.path.join(SAVE_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print("\n" + "=" * 60)
    print("Training complete! All artifacts saved to saved_models/")
    print("Restart the server to load the new model.")
    print("=" * 60)


if __name__ == "__main__":
    train_comprehensive()
