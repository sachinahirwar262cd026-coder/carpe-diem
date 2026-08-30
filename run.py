"""
Carpe Diem — One-Click Launcher.

Starts both services:
  1. ML Microservice  → http://localhost:8001  (models/air_pollution/)
  2. Backend Gateway  → http://localhost:8000  (backend/)

Usage:
    py -3.10 run.py
"""
import os
import sys
import subprocess
import time
import signal

ROOT = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(ROOT, "models", "air_pollution")
BACKEND_DIR = os.path.join(ROOT, "backend")
PYTHON = sys.executable

processes = []


def start(cwd: str, port: int, label: str):
    p = subprocess.Popen(
        [PYTHON, "-m", "uvicorn", "main:app",
         "--host", "0.0.0.0", "--port", str(port), "--reload"],
        cwd=cwd,
    )
    processes.append(p)
    print(f"[OK] {label} started (PID {p.pid}) at http://localhost:{port}")
    return p


def shutdown(sig, frame):
    print("\n[>>] Shutting down all services...")
    for p in processes:
        p.terminate()
    sys.exit(0)


signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)

print("""
+===================================================+
|  Carpe Diem — Full Stack Launcher                 |
|  ML Microservice (8001) + API Gateway (8000)      |
+===================================================+
""")

start(ML_DIR, 8001, "ML Microservice   (models/air_pollution/)")
time.sleep(3)  # Give ML service time to load TF models
start(BACKEND_DIR, 8000, "Backend Gateway   (backend/)")

print("""
[>>] Services running:
     ML Microservice : http://localhost:8001/docs
     API Gateway     : http://localhost:8000/docs
     React Frontend  : cd frontend && npm run dev  →  http://localhost:5173

Press Ctrl+C to stop all services.
""")

for p in processes:
    p.wait()
