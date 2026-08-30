"""
Root Convenience Launcher for Air Quality Forecasting Server
Delegates to models/air_pollution/run_server.py
"""

import os
import sys
import subprocess

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "air_pollution")

if os.path.exists(MODEL_DIR):
    os.chdir(MODEL_DIR)
    script_path = os.path.join(MODEL_DIR, "run_server.py")
    subprocess.run([sys.executable, script_path])
else:
    print(f"Error: Directory '{MODEL_DIR}' not found.")
    sys.exit(1)
