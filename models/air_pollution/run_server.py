"""
PranaAI ML Microservice Launcher — starts on port 8001.
The backend gateway (carpe_diem/backend/) proxies to this service.
"""
import os
import sys
import subprocess

PORT = 8001
HOST = "0.0.0.0"

banner = """
+===========================================================+
|   PranaAI  —  India AQI Intelligence ML Microservice     |
|   Bi-LSTM + LightGBM | CPCB NAQI | Groq Report Engine    |
+===========================================================+
"""
print(banner)
print(f"[>>] Starting ML microservice at http://localhost:{PORT}")
print(f"     API Docs : http://localhost:{PORT}/docs")
print(f"     Forecast : POST http://localhost:{PORT}/api/forecast")
print(f"     Report   : POST http://localhost:{PORT}/api/generate-report")
print()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
subprocess.run(
    [sys.executable, "-m", "uvicorn", "main:app",
     "--host", HOST, "--port", str(PORT), "--reload"],
    cwd=os.path.dirname(os.path.abspath(__file__)),
)
