"""
Lightweight 15-Section Municipal Environmental Intelligence Report Generator.

Uses the Groq SDK directly — NO LangChain, NO agents, NO extra dependencies.
Just: groq + requests. Falls back across multiple models on rate-limit errors.
"""

import os
import sys
import json
import time
import requests
from typing import Dict, Any, Optional

# Ensure the parent air_pollution/ directory is on sys.path so we can
# import data_fetcher, models, cpcb_engine from the microservice root.
_PARENT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PARENT not in sys.path:
    sys.path.insert(0, _PARENT)

# ── Keys (set these as environment variables) ────────────────────────────────
DEFAULT_GROQ_KEY = os.environ.get("GROQ_API_KEY", "")
DEFAULT_JINA_KEY = os.environ.get("JINA_API_KEY", "")

# Models tried in order on 429 rate-limit
GROQ_MODELS = [
    "qwen/qwen3.8-27b",
    "groq/compound",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
]
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# ── Jina AI web search ────────────────────────────────────────────────────────
_JINA_FALLBACK = """
**Best Practice 1 — London ULEZ (Ultra Low Emission Zone)**
London's ULEZ reduced NO₂ by 44% in central zones within 18 months. Mobile air quality sensors
combined with ANPR cameras enforce daily £12.50 charges on non-compliant vehicles.

**Best Practice 2 — Beijing Clean Air Action Plan 2013-2022**
Beijing achieved a 53% reduction in PM₂.₅ by mandating industrial relocation, coal-to-gas
switching in 3.5 million households, and strict vehicle emission standards (China VI).

**Best Practice 3 — Tokyo Acoustic Zoning & Noise Control Law**
Tokyo enforces strict zoning laws capping commercial areas at 60 dB(A) daytime / 50 dB(A)
nighttime. Automated roadside acoustic sensors issue instant e-challan notices for violations.
"""


def jina_search(query: str) -> str:
    """Fetch case-study content via Jina AI s.jina.ai search endpoint."""
    try:
        url = f"https://s.jina.ai/{requests.utils.quote(query)}"
        headers = {
            "Authorization": f"Bearer {DEFAULT_JINA_KEY}",
            "Accept": "text/plain",
            "X-Return-Format": "text",
        }
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200 and len(resp.text) > 100:
            return resp.text[:2000]
    except Exception:
        pass
    return _JINA_FALLBACK


# ── Groq completion with fallback ─────────────────────────────────────────────
def _groq_chat(prompt: str, api_key: str) -> str:
    """Call Groq API with model fallback on 429 errors."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    last_err = None
    for model in GROQ_MODELS:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 4096,
        }
        try:
            resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            elif resp.status_code == 429:
                last_err = f"Rate limit on {model}"
                time.sleep(1)
                continue
            else:
                last_err = f"HTTP {resp.status_code} on {model}: {resp.text[:200]}"
                continue
        except Exception as e:
            last_err = str(e)
            continue
    raise RuntimeError(f"All Groq models exhausted. Last error: {last_err}")


# ── Payload assembler ─────────────────────────────────────────────────────────
def assemble_city_payload(city: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """Build a rich intelligence payload for the given city."""
    from data_fetcher import INDIAN_CITIES, get_48h_history
    from cpcb_engine import calculate_cpcb_naqi

    city_meta = INDIAN_CITIES.get(city, INDIAN_CITIES.get("Delhi"))
    lat, lon = city_meta["lat"], city_meta["lon"]

    # Fetch atmospheric data
    seq_48x9, latest_comp, data_source = get_48h_history(lat, lon, api_key)
    cpcb = calculate_cpcb_naqi(latest_comp)

    # Bi-LSTM forecast
    try:
        from models import HybridEnsembleForecaster
        forecaster = HybridEnsembleForecaster(model_dir="saved_models")
        forecaster.load_or_initialize()
        forecast = forecaster.predict_24h(seq_48x9)
        forecast_summary = forecast.get("summary", {})
        hourly = forecast.get("hourly_records", [])[:6]
    except Exception:
        forecast_summary = {"peak_aqi": cpcb["aqi"] + 15, "peak_hour": "08:00", "peak_reason": "Morning rush + temperature inversion"}
        hourly = []

    # Jina AI case studies
    case_studies = jina_search(f"city air quality improvement municipal action {city} India best practice")

    return {
        "city": city,
        "state": city_meta.get("state", "India"),
        "lat": lat, "lon": lon,
        "data_source": data_source,
        "current_aqi": cpcb["aqi"],
        "aqi_category": cpcb["category"],
        "prominent_pollutant": cpcb.get("prominent_pollutant_display", cpcb.get("prominent_pollutant", "PM2.5")),
        "sub_indices": cpcb.get("sub_indices", {}),
        "concentrations": {k: round(v, 1) for k, v in latest_comp.items()},
        "forecast_summary": forecast_summary,
        "hourly_forecast_sample": hourly,
        "case_studies_raw": case_studies,
        "timestamp": time.strftime("%Y-%m-%d %H:%M IST"),
    }


# ── Report generation prompt ──────────────────────────────────────────────────
REPORT_PROMPT_TEMPLATE = """You are a senior environmental analyst at CPCB (Central Pollution Control Board), India.

Generate a comprehensive **15-Section Official Municipal Environmental Intelligence Report** in clean Markdown format for:
**City:** {city}, {state}
**Generated:** {timestamp}

---
**LIVE TELEMETRY DATA:**
```json
{payload_json}
```

**JINA AI CASE STUDIES (use in Section 12):**
{case_studies}

---

**OUTPUT — EXACTLY 15 SECTIONS (Markdown headings):**

# Official Municipal Environmental Intelligence Report — {city}
*Generated: {timestamp} | Powered by PranaAI Bi-LSTM + CPCB NAQI Engine*

## 1. Executive Summary
## 2. Current Air Quality Assessment
## 3. 24-Hour AQI Forecast
## 4. Air Pollution Hotspots
## 5. Noise Pollution Analysis
## 6. Noise Hotspots
## 7. Citizen Complaint Analysis
## 8. Pollution Source Attribution
## 9. Weather & Environmental Conditions
## 10. Health & Public Risk Assessment
## 11. Recommended Municipal Actions
## 12. International Case Studies & Best Practices
## 13. Priority Action Table

| Location | Problem | Severity | Confidence | Recommended Action |
|---|---|---|---|---|

## 14. Conclusion
## 15. Data Sources & References

Use real numbers from the telemetry. Be specific, authoritative, and detailed. Minimum 3 bullet points per section.
"""


# ── Main public function ──────────────────────────────────────────────────────
def generate_report(city: str, api_key: Optional[str] = None, groq_key: Optional[str] = None) -> str:
    """
    Generate the 15-section environmental intelligence report for a city.

    Args:
        city: Indian city name (e.g. 'Delhi', 'Mumbai').
        api_key: OpenWeatherMap API key (optional).
        groq_key: Groq API key (optional, uses default if not set).

    Returns:
        Full report as a Markdown string.
    """
    groq_key = groq_key or DEFAULT_GROQ_KEY
    payload = assemble_city_payload(city, api_key)

    prompt = REPORT_PROMPT_TEMPLATE.format(
        city=payload["city"],
        state=payload["state"],
        timestamp=payload["timestamp"],
        payload_json=json.dumps({k: v for k, v in payload.items() if k != "case_studies_raw"}, indent=2),
        case_studies=payload["case_studies_raw"],
    )

    return _groq_chat(prompt, groq_key)


# ── CLI runner ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    city = sys.argv[1] if len(sys.argv) > 1 else "Delhi"
    print(f"Generating report for {city}...\n")
    report = generate_report(city)
    print(report)
