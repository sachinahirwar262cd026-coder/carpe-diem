"""
Official Indian Central Pollution Control Board (CPCB) NAQI Calculation Engine.

Implements the official Indian National Air Quality Index (NAQI) piecewise linear
sub-index formula across the 7 criteria pollutants:
- PM2.5 (24-hr avg, µg/m³)
- PM10 (24-hr avg, µg/m³)
- NO2 (24-hr avg, µg/m³)
- SO2 (24-hr avg, µg/m³)
- CO (8-hr avg, mg/m³ or converted from µg/m³)
- O3 (8-hr avg, µg/m³)
- NH3 (24-hr avg, µg/m³)

According to CPCB standard:
Overall AQI is calculated as the maximum of sub-indices, provided at least 3 pollutants
are present with at least one being PM2.5 or PM10.
"""

from typing import Dict, Any, Tuple, Optional


# CPCB Breakpoint Tables (Concentration Min, Concentration Max, Index Min, Index Max)
CPCB_BREAKPOINTS = {
    "pm2_5": [
        (0.0, 30.0, 0, 50),
        (30.1, 60.0, 51, 100),
        (60.1, 90.0, 101, 200),
        (90.1, 120.0, 201, 300),
        (120.1, 250.0, 301, 400),
        (250.1, 500.0, 401, 500),
    ],
    "pm10": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 250.0, 101, 200),
        (250.1, 350.0, 201, 300),
        (350.1, 430.0, 301, 400),
        (430.1, 600.0, 401, 500),
    ],
    "no2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 180.0, 101, 200),
        (180.1, 280.0, 201, 300),
        (280.1, 400.0, 301, 400),
        (400.1, 800.0, 401, 500),
    ],
    "so2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 380.0, 101, 200),
        (380.1, 800.0, 201, 300),
        (800.1, 1600.0, 301, 400),
        (1600.1, 2400.0, 401, 500),
    ],
    "co": [
        (0.0, 1.0, 0, 50),        # mg/m3
        (1.1, 2.0, 51, 100),
        (2.1, 10.0, 101, 200),
        (10.1, 17.0, 201, 300),
        (17.1, 34.0, 301, 400),
        (34.1, 50.0, 401, 500),
    ],
    "o3": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 168.0, 101, 200),
        (168.1, 208.0, 201, 300),
        (208.1, 748.0, 301, 400),
        (748.1, 1000.0, 401, 500),
    ],
    "nh3": [
        (0.0, 200.0, 0, 50),
        (200.1, 400.0, 51, 100),
        (400.1, 800.0, 101, 200),
        (800.1, 1200.0, 201, 300),
        (1200.1, 1800.0, 301, 400),
        (1800.1, 2400.0, 401, 500),
    ],
}

# CPCB AQI Categories and Colors
AQI_CATEGORIES = [
    {
        "min": 0,
        "max": 50,
        "category": "Good",
        "color": "#10B981",       # Emerald Green
        "bg_color": "rgba(16, 185, 129, 0.15)",
        "health_impact": "Minimal impact. Air quality is considered satisfactory.",
        "grap_stage": "Normal"
    },
    {
        "min": 51,
        "max": 100,
        "category": "Satisfactory",
        "color": "#84CC16",       # Lime Green
        "bg_color": "rgba(132, 204, 22, 0.15)",
        "health_impact": "Minor breathing discomfort to sensitive people.",
        "grap_stage": "Normal"
    },
    {
        "min": 101,
        "max": 200,
        "category": "Moderate",
        "color": "#EAB308",       # Yellow
        "bg_color": "rgba(234, 179, 8, 0.15)",
        "health_impact": "Breathing discomfort to people with lung, asthma, and heart diseases.",
        "grap_stage": "Stage I (Poor / Moderate Warning)"
    },
    {
        "min": 201,
        "max": 300,
        "category": "Poor",
        "color": "#F97316",       # Orange
        "bg_color": "rgba(249, 115, 22, 0.15)",
        "health_impact": "Breathing discomfort to most people on prolonged exposure.",
        "grap_stage": "Stage I / II (Enforce dust & vehicle curbs)"
    },
    {
        "min": 301,
        "max": 400,
        "category": "Very Poor",
        "color": "#EF4444",       # Red
        "bg_color": "rgba(239, 68, 68, 0.15)",
        "health_impact": "Respiratory illness to people on prolonged exposure. Severe effect on sensitive groups.",
        "grap_stage": "Stage III (Strict ban on construction & diesel gensets)"
    },
    {
        "min": 401,
        "max": 9999,
        "category": "Severe",
        "color": "#7F1D1D",       # Dark Maroon / Purple
        "bg_color": "rgba(127, 29, 29, 0.25)",
        "health_impact": "Affects healthy people and seriously impacts those with existing diseases. Emergency condition.",
        "grap_stage": "Stage IV (Emergency / Odd-Even / School Closures)"
    },
]


def calculate_sub_index(pollutant: str, concentration: float) -> Optional[float]:
    """
    Calculates the CPCB sub-index for a specific pollutant concentration
    using piecewise linear interpolation:
    
    I = [(I_hi - I_lo) / (B_hi - B_lo)] * (C - B_lo) + I_lo
    """
    if pollutant not in CPCB_BREAKPOINTS:
        return None
    
    if concentration is None or concentration < 0:
        return 0.0

    # If CO is given in ug/m3, convert to mg/m3 if > 50
    if pollutant == "co" and concentration > 50.0:
        concentration = concentration / 1000.0

    breakpoints = CPCB_BREAKPOINTS[pollutant]
    
    # Check if exceeds top breakpoint
    max_b_hi = breakpoints[-1][1]
    if concentration >= max_b_hi:
        # Extrapolate beyond 500 capped at 500 or linear scaling
        b_lo, b_hi, i_lo, i_hi = breakpoints[-1]
        sub_index = i_lo + ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo)
        return min(round(sub_index, 1), 500.0)

    for b_lo, b_hi, i_lo, i_hi in breakpoints:
        if b_lo <= concentration <= b_hi:
            sub_index = i_lo + ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo)
            return round(sub_index, 1)

    return 0.0


def calculate_cpcb_naqi(pollutant_data: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculates overall Indian NAQI from dictionary of pollutant concentrations.
    
    Expected keys in pollutant_data:
      pm2_5, pm10, no2, so2, co, o3, nh3 (or subset)
    
    Returns:
      {
        "aqi": int,
        "category": str,
        "color": str,
        "prominent_pollutant": str,
        "sub_indices": dict,
        "health_impact": str,
        "grap_stage": str
      }
    """
    sub_indices: Dict[str, float] = {}
    
    # Standardize pollutant keys
    key_mapping = {
        "pm2_5": ["pm2_5", "pm25", "pm2.5", "PM2.5"],
        "pm10": ["pm10", "PM10"],
        "no2": ["no2", "NO2"],
        "so2": ["so2", "SO2"],
        "co": ["co", "CO"],
        "o3": ["o3", "O3", "ozone"],
        "nh3": ["nh3", "NH3", "ammonia"]
    }
    
    clean_data: Dict[str, float] = {}
    for standard_key, aliases in key_mapping.items():
        for alias in aliases:
            if alias in pollutant_data and pollutant_data[alias] is not None:
                try:
                    clean_data[standard_key] = float(pollutant_data[alias])
                    break
                except (ValueError, TypeError):
                    continue

    for pollutant, conc in clean_data.items():
        sub_idx = calculate_sub_index(pollutant, conc)
        if sub_idx is not None:
            sub_indices[pollutant] = sub_idx

    if not sub_indices:
        return {
            "aqi": 0,
            "category": "Unknown",
            "color": "#94A3B8",
            "prominent_pollutant": "None",
            "sub_indices": {},
            "health_impact": "Insufficient data available to compute AQI.",
            "grap_stage": "N/A"
        }

    # Identify prominent pollutant (the one with the maximum sub-index)
    prominent_pollutant = max(sub_indices, key=sub_indices.get)
    max_aqi = int(round(sub_indices[prominent_pollutant]))

    # Find matching category
    category_info = AQI_CATEGORIES[-1]
    for cat in AQI_CATEGORIES:
        if cat["min"] <= max_aqi <= cat["max"]:
            category_info = cat
            break

    # Format prominent pollutant display name
    pollutant_display_names = {
        "pm2_5": "PM2.5 (Fine Particulate)",
        "pm10": "PM10 (Coarse Particulate)",
        "no2": "NO2 (Nitrogen Dioxide)",
        "so2": "SO2 (Sulfur Dioxide)",
        "co": "CO (Carbon Monoxide)",
        "o3": "O3 (Ground-level Ozone)",
        "nh3": "NH3 (Ammonia)"
    }

    return {
        "aqi": max_aqi,
        "category": category_info["category"],
        "color": category_info["color"],
        "bg_color": category_info["bg_color"],
        "prominent_pollutant": prominent_pollutant,
        "prominent_pollutant_display": pollutant_display_names.get(prominent_pollutant, prominent_pollutant.upper()),
        "sub_indices": sub_indices,
        "health_impact": category_info["health_impact"],
        "grap_stage": category_info["grap_stage"]
    }
