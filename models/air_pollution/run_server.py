"""
Air Quality Intelligence & Forecasting -- One-Click Server Launcher
Run this file to start the full production-ready API + Dashboard.
"""

import os
import sys
import subprocess

BANNER = """
+==================================================================+
|                                                                  |
|    Air Quality Forecasting & Intelligence Engine                 |
|    Deep Learning | CPCB NAQI | 24h Forecast | Leaflet Map        |
|    FastAPI Backend + Glassmorphic Dashboard                      |
|                                                                  |
+==================================================================+
"""

print(BANNER)

# Check if models are trained
if not os.path.exists(os.path.join("saved_models", "attention_lstm.keras")):
    print("[!] Model weights not found. Running training pipeline first...\n")
    result = subprocess.run([sys.executable, "train.py"], capture_output=False)
    if result.returncode != 0:
        print("[X] Training failed. Please check train.py output above.")
        sys.exit(1)
    print("\n[OK] Training complete. Starting server...\n")
else:
    print("[OK] Model weights found in saved_models/")

print("[>>] Starting FastAPI server at http://localhost:8000\n")
print("    Dashboard :  http://localhost:8000")
print("    API Docs  :  http://localhost:8000/docs")
print("    Forecast  :  POST http://localhost:8000/api/forecast")
print("    Cities    :  GET  http://localhost:8000/api/cities")
print("\nPress Ctrl+C to stop.\n")

import uvicorn
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, log_level="info")
