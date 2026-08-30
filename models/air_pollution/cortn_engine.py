"""
CORTN (Calculation of Road Traffic Noise) Mathematical Engine.

Implements the official Department of Transport / Welsh Office CORTN 1988
mathematical formulation for road traffic noise prediction, acoustic propagation,
and CPCB (Noise Pollution Regulation and Control Rules, 2000) compliance analysis.
"""

import math
from typing import Dict, List, Any, Optional

# CPCB Ambient Air Quality Standards in respect of Noise (dB(A) Leq)
CPCB_NOISE_STANDARDS = {
    "industrial": {"day": 75.0, "night": 70.0, "desc": "Industrial Area"},
    "commercial": {"day": 65.0, "night": 55.0, "desc": "Commercial Area"},
    "residential": {"day": 55.0, "night": 45.0, "desc": "Residential Area"},
    "silence": {"day": 50.0, "night": 40.0, "desc": "Silence Zone (100m around hospitals/schools)"},
}

SURFACE_CORRECTIONS = {
    "asphalt": 0.0,
    "concrete": 2.5,
    "porous": -3.5,
    "cobblestone": 4.0,
}

CITY_ROAD_CORRIDORS = {
    "delhi": [
        {"name": "Ring Road - Ashram Chowk", "zone": "commercial", "q_base": 4200, "v_base": 28, "p_base": 22, "gradient": 1.5, "distance": 12.0},
        {"name": "Anand Vihar ISBT Corridor", "zone": "commercial", "q_base": 3800, "v_base": 22, "p_base": 28, "gradient": 0.5, "distance": 15.0},
        {"name": "Connaught Place Outer Circle", "zone": "commercial", "q_base": 2600, "v_base": 35, "p_base": 12, "gradient": 0.0, "distance": 10.0},
        {"name": "IIT Flyover - Outer Ring Road", "zone": "residential", "q_base": 3500, "v_base": 42, "p_base": 15, "gradient": 2.0, "distance": 18.0},
        {"name": "AIIMS Medical Enclave", "zone": "silence", "q_base": 2100, "v_base": 25, "p_base": 14, "gradient": 0.5, "distance": 20.0},
    ],
    "bengaluru": [
        {"name": "Silk Board Junction Flyover", "zone": "commercial", "q_base": 4600, "v_base": 18, "p_base": 24, "gradient": 1.0, "distance": 10.0},
        {"name": "Outer Ring Road - Marathahalli", "zone": "commercial", "q_base": 4100, "v_base": 24, "p_base": 20, "gradient": 1.5, "distance": 14.0},
        {"name": "Hebbal Flyover Expressway", "zone": "commercial", "q_base": 4400, "v_base": 48, "p_base": 22, "gradient": 2.5, "distance": 15.0},
        {"name": "Koramangala 80ft Road", "zone": "residential", "q_base": 2200, "v_base": 32, "p_base": 10, "gradient": 0.5, "distance": 12.0},
        {"name": "Victoria Hospital Zone", "zone": "silence", "q_base": 1800, "v_base": 22, "p_base": 12, "gradient": 0.0, "distance": 22.0},
    ],
    "mumbai": [
        {"name": "Western Express Highway - Bandra", "zone": "commercial", "q_base": 4800, "v_base": 32, "p_base": 25, "gradient": 1.0, "distance": 12.0},
        {"name": "Eastern Freeway - Chembur", "zone": "commercial", "q_base": 3900, "v_base": 55, "p_base": 18, "gradient": 1.5, "distance": 16.0},
        {"name": "Dadar TT Circle Corridor", "zone": "commercial", "q_base": 3600, "v_base": 20, "p_base": 22, "gradient": 0.0, "distance": 10.0},
        {"name": "Bandra Kurla Complex (BKC)", "zone": "commercial", "q_base": 3200, "v_base": 38, "p_base": 14, "gradient": 0.5, "distance": 15.0},
        {"name": "Tata Memorial Hospital Zone", "zone": "silence", "q_base": 1900, "v_base": 24, "p_base": 10, "gradient": 0.0, "distance": 20.0},
    ],
}


def calculate_cortn_noise(
    vehicles_per_hour: float,
    mean_speed_kmph: float,
    heavy_vehicle_pct: float,
    road_gradient_pct: float = 0.0,
    surface_type: str = "asphalt",
    distance_meters: float = 13.5,
    zone_type: str = "commercial",
    is_night: bool = False,
) -> Dict[str, Any]:
    """
    Executes standard CORTN mathematical equations calibrated to 1-hour traffic flow:
    
    1. Basic noise level at reference distance d = 13.5m, V = 75km/h, p = 0%:
       L10_basic = 42.2 + 10 * log10(q)
    
    2. Speed correction (referenced to V = 75 km/h):
       Delta_v = 33 * log10(v + 40 + 500/v) - 68.8
       
    3. Heavy vehicle correction:
       Delta_p = 10 * log10(1 + (5 * p) / v)
       
    4. Gradient correction:
       Delta_G = 0.3 * G
       
    5. Surface correction:
       Delta_S from surface table
       
    6. Distance attenuation:
       Delta_d = -10 * log10(d / 13.5)
       
    7. Continuous equivalent:
       Leq = L10 - 3.0
       Lmax = L10 + 7.5
    """
    q = max(float(vehicles_per_hour), 50.0)
    v = max(min(float(mean_speed_kmph), 130.0), 10.0)
    p = max(min(float(heavy_vehicle_pct), 100.0), 0.0)
    g = max(float(road_gradient_pct), 0.0)
    d = max(float(distance_meters), 3.5)

    # 1. Basic level
    l10_basic = 42.2 + 10.0 * math.log10(q)

    # 2. Speed correction (relative to 75 km/h reference speed)
    v_term = v + 40.0 + (500.0 / v)
    delta_v = 33.0 * math.log10(v_term) - 68.83

    # 3. Heavy vehicle correction
    p_term = 1.0 + ((5.0 * p) / v)
    delta_p = 10.0 * math.log10(p_term)

    # 4. Gradient correction
    delta_g = 0.3 * g

    # 5. Surface correction
    delta_s = SURFACE_CORRECTIONS.get(surface_type.lower(), 0.0)

    # 6. Distance attenuation
    delta_d = -10.0 * math.log10(d / 13.5)

    # Total L10 (1-hour)
    l10_1h = l10_basic + delta_v + delta_p + delta_g + delta_s + delta_d

    # Clamp to realistic outdoor acoustic range (40 - 95 dB)
    l10_1h = max(min(l10_1h, 95.0), 40.0)

    # Continuous Equivalent & Peak
    l_eq = round(l10_1h - 3.0, 1)
    l_max = round(l10_1h + 7.5, 1)
    l10_final = round(l10_1h, 1)

    # CPCB Standard Evaluation
    standard_info = CPCB_NOISE_STANDARDS.get(zone_type.lower(), CPCB_NOISE_STANDARDS["commercial"])
    cpcb_limit = standard_info["night"] if is_night else standard_info["day"]
    violation_db = round(max(0.0, l_eq - cpcb_limit), 1)
    is_violation = violation_db > 0.0

    # Categorization
    if l_eq < 55.0:
        category = "Quiet / Normal"
        severity = "good"
    elif l_eq < 65.0:
        category = "Moderate Acoustic Stress"
        severity = "moderate"
    elif l_eq < 75.0:
        category = "High Decibel Traffic Stress"
        severity = "poor"
    else:
        category = "Severe Acoustic Violation"
        severity = "severe"

    return {
        "l10_1h": l10_final,
        "l_eq": l_eq,
        "l_max": l_max,
        "cpcb_limit": cpcb_limit,
        "violation_db": violation_db,
        "is_violation": is_violation,
        "category": category,
        "severity": severity,
        "zone_type": zone_type,
        "inputs": {
            "vehicles_per_hour": q,
            "mean_speed_kmph": v,
            "heavy_vehicle_pct": p,
            "road_gradient_pct": g,
            "surface_type": surface_type,
            "distance_meters": d,
            "is_night": is_night,
        },
        "math_breakdown": {
            "l10_basic": round(l10_basic, 2),
            "delta_speed": round(delta_v, 2),
            "delta_heavy": round(delta_p, 2),
            "delta_gradient": round(delta_g, 2),
            "delta_surface": round(delta_s, 2),
            "delta_distance": round(delta_d, 2),
            "formula": "L10 = 42.2 + 10*log10(Q) + Delta_V + Delta_p + Delta_G + Delta_S + Delta_d",
        },
    }


def generate_diurnal_24h_noise(
    base_q: float = 3200,
    base_v: float = 35,
    base_p: float = 18,
    zone_type: str = "commercial"
) -> List[Dict[str, Any]]:
    """Generates 24-hour diurnal noise forecast using CORTN traffic curves."""
    hourly_profiles = []
    
    # Diurnal traffic factors for 24 hours (00:00 to 23:00)
    diurnal_factors = [
        (0.20, 1.45, 2.2),  # 00:00
        (0.15, 1.50, 2.4),  # 01:00
        (0.12, 1.55, 2.5),  # 02:00
        (0.15, 1.50, 2.3),  # 03:00
        (0.25, 1.40, 2.0),  # 04:00
        (0.45, 1.30, 1.6),  # 05:00
        (0.70, 1.15, 1.3),  # 06:00
        (0.95, 0.95, 1.0),  # 07:00
        (1.35, 0.70, 0.8),  # 08:00 Peak rush
        (1.45, 0.65, 0.7),  # 09:00 Peak congestion
        (1.30, 0.75, 0.8),  # 10:00
        (1.10, 0.85, 0.9),  # 11:00
        (1.05, 0.90, 0.9),  # 12:00 Midday
        (1.00, 0.92, 0.9),  # 13:00
        (1.05, 0.90, 0.9),  # 14:00
        (1.15, 0.85, 0.9),  # 15:00
        (1.30, 0.75, 0.8),  # 16:00
        (1.50, 0.60, 0.7),  # 17:00 Evening rush
        (1.55, 0.55, 0.7),  # 18:00 Max evening rush
        (1.40, 0.65, 0.8),  # 19:00
        (1.20, 0.80, 1.1),  # 20:00
        (0.90, 0.95, 1.4),  # 21:00
        (0.60, 1.15, 1.8),  # 22:00
        (0.35, 1.30, 2.0),  # 23:00
    ]

    for h, (q_m, v_m, p_m) in enumerate(diurnal_factors):
        hour_str = f"{h:02d}:00"
        is_night = h < 6 or h >= 22
        
        q_h = base_q * q_m
        v_h = max(base_v * v_m, 12.0)
        p_h = min(base_p * p_m, 45.0)

        calc = calculate_cortn_noise(
            vehicles_per_hour=q_h,
            mean_speed_kmph=v_h,
            heavy_vehicle_pct=p_h,
            zone_type=zone_type,
            is_night=is_night,
        )

        hourly_profiles.append({
            "hour": hour_str,
            "hour_num": h,
            "l_eq": calc["l_eq"],
            "l10": calc["l10_1h"],
            "l_max": calc["l_max"],
            "cpcb_limit": calc["cpcb_limit"],
            "violation": calc["violation_db"],
            "traffic_flow": round(q_h),
            "speed_kmph": round(v_h, 1),
            "heavy_pct": round(p_h, 1),
            "is_night": is_night,
        })

    return hourly_profiles


def get_city_corridor_predictions(city_name: str) -> List[Dict[str, Any]]:
    """Retrieves major arterial road corridors for a city and runs dynamic CORTN calculations."""
    city_key = city_name.lower().split()[0]
    corridors = CITY_ROAD_CORRIDORS.get(city_key)

    if not corridors:
        corridors = [
            {"name": f"{city_name} Arterial Outer Ring Road", "zone": "commercial", "q_base": 3400, "v_base": 32, "p_base": 18, "gradient": 1.0, "distance": 12.0},
            {"name": f"{city_name} Central Transit Bus Corridor", "zone": "commercial", "q_base": 3100, "v_base": 24, "p_base": 26, "gradient": 0.5, "distance": 10.0},
            {"name": f"{city_name} Highway Expressway Bypass", "zone": "commercial", "q_base": 3800, "v_base": 50, "p_base": 22, "gradient": 1.5, "distance": 18.0},
            {"name": f"{city_name} Civil Hospital Zone", "zone": "silence", "q_base": 1800, "v_base": 26, "p_base": 10, "gradient": 0.0, "distance": 22.0},
            {"name": f"{city_name} Residential Colony Main Avenue", "zone": "residential", "q_base": 2000, "v_base": 30, "p_base": 8, "gradient": 0.5, "distance": 14.0},
        ]

    results = []
    for c in corridors:
        pred = calculate_cortn_noise(
            vehicles_per_hour=c["q_base"],
            mean_speed_kmph=c["v_base"],
            heavy_vehicle_pct=c["p_base"],
            road_gradient_pct=c["gradient"],
            distance_meters=c["distance"],
            zone_type=c["zone"],
        )
        results.append({
            "name": c["name"],
            "zone": c["zone"],
            "l_eq": pred["l_eq"],
            "l_max": pred["l_max"],
            "cpcb_limit": pred["cpcb_limit"],
            "violation": pred["violation_db"],
            "category": pred["category"],
            "severity": pred["severity"],
            "traffic_flow": c["q_base"],
            "speed_kmph": c["v_base"],
            "heavy_pct": c["p_base"],
            "gradient": c["gradient"],
            "distance": c["distance"],
        })

    results.sort(key=lambda x: x["l_eq"], reverse=True)
    return results
