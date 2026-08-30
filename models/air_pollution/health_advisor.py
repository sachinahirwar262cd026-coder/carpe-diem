"""
Health Intelligence and CPCB GRAP (Graded Response Action Plan) Advisory Engine.

Provides persona-based health recommendations, alert classifications,
and diurnal peak pollution window analysis for Indian citizens, authorities,
and sensitive vulnerable groups.
"""

from typing import Dict, List, Any, Optional


def get_health_advisory(aqi: int, prominent_pollutant: str = "pm2_5", peak_hour_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generates tailored, actionable health advisories based on Indian NAQI guidelines,
    CPCB health advisory matrix, and GRAP emergency stages.
    """
    if peak_hour_info is None:
        peak_hour_info = {
            "peak_aqi": aqi,
            "peak_hour": "+0h",
            "reason": "Standard diurnal pattern"
        }
    if aqi <= 50:
        category = "Good"
        color = "#10B981"
        badge = "Optimal"
        grap_stage = "Normal Conditions"
        general_advice = "Air quality is pristine and healthy. Great day for outdoor activities, exercises, and ventilation."
        sensitive_advice = "No special precautions needed. Safe for all age groups."
        athlete_advice = "Optimal conditions for high-intensity outdoor running, cycling, and sports."
        mask_recommendation = "No mask required."
        air_purifier_needed = False
        action_items = [
            "Enjoy outdoor walks and open window ventilation",
            "Optimal day for sports tournaments and school outdoor play"
        ]
    elif aqi <= 100:
        category = "Satisfactory"
        color = "#84CC16"
        badge = "Acceptable"
        grap_stage = "Normal Conditions"
        general_advice = "Air quality is acceptable. Minor discomfort may be experienced by unusually sensitive individuals."
        sensitive_advice = "Individuals with acute respiratory conditions should monitor symptoms and keep inhalers handy."
        athlete_advice = "Normal outdoor workouts permitted. Stay hydrated."
        mask_recommendation = "Not required for general population."
        air_purifier_needed = False
        action_items = [
            "Good day for outdoor activities",
            "Sensitive individuals should avoid heavy prolonged exertion"
        ]
    elif aqi <= 200:
        category = "Moderate"
        color = "#EAB308"
        badge = "Caution"
        grap_stage = "GRAP Stage I (Poor / Warning Level)"
        general_advice = "Breathing discomfort possible for sensitive individuals, children, and elderly. Healthy people may experience mild throat irritation."
        sensitive_advice = "People with asthma, COPD, bronchitis, or cardiovascular illness should reduce prolonged outdoor exertion."
        athlete_advice = "Shift high-intensity workouts to early afternoon when mixing height is higher. Avoid morning rush-hour training."
        mask_recommendation = "Recommended (N95 or cloth mask) for sensitive individuals near heavy traffic corridors."
        air_purifier_needed = False
        action_items = [
            "Close windows during morning peak rush hours (07:00 - 09:30 AM)",
            "Sensitive groups should keep emergency bronchodilators accessible",
            "Authorities enforce dust control at active construction sites"
        ]
    elif aqi <= 300:
        category = "Poor"
        color = "#F97316"
        badge = "Unhealthy"
        grap_stage = "GRAP Stage II (High Alert / Enforce Curbs)"
        general_advice = "Breathing discomfort to most people on prolonged exposure. Significant risk of respiratory flare-ups in sensitive groups."
        sensitive_advice = "Avoid all unnecessary outdoor activities. Keep windows closed and use HEPA air purifiers indoors."
        athlete_advice = "Switch completely to indoor gyms, treadmill running, or home yoga. Avoid outdoor road jogging."
        mask_recommendation = "N95 / FFP2 mask strongly advised for anyone stepping outdoors."
        air_purifier_needed = True
        action_items = [
            "Wear N95/KN95 respirator when outdoors",
            "Avoid outdoor morning and evening walks (shift to 1:00 PM - 4:00 PM if essential)",
            "Run indoor air purifiers on continuous auto mode",
            "GRAP Stage II: Ban on diesel generator sets, intensified mechanized road sweeping"
        ]
    elif aqi <= 400:
        category = "Very Poor"
        color = "#EF4444"
        badge = "Severe Risk"
        grap_stage = "GRAP Stage III (Severe Restrictions)"
        general_advice = "Respiratory illness likely for general population on prolonged exposure. Serious health hazard for elderly, children, and heart/lung patients."
        sensitive_advice = "Strict stay-at-home advisory for asthmatics, cardiac patients, pregnant women, and senior citizens."
        athlete_advice = "Strict ban on intense cardiovascular exertion outdoors. Strenuous breathing introduces toxic particulates deep into alveoli."
        mask_recommendation = "Strict N95/N99 mask mandatory for any outdoor exposure."
        air_purifier_needed = True
        action_items = [
            "Mandatory N95 mask outdoors; minimize transit time",
            "Seal doors and windows; run indoor HEPA filtration",
            "Vulnerable personas must avoid all outdoor movement",
            "GRAP Stage III: Full ban on non-essential construction & demolition work, strict BS-III petrol & BS-IV diesel vehicle restrictions"
        ]
    else:
        category = "Severe"
        color = "#7F1D1D"
        badge = "Health Emergency"
        grap_stage = "GRAP Stage IV (Emergency / Disaster Mode)"
        general_advice = "Emergency health hazard. Severe toxic exposure affecting healthy individuals and critically endangering sensitive groups."
        sensitive_advice = "Medical emergency danger. Maximum indoor isolation, continuous medical monitoring, and oxygen/inhaler readiness."
        athlete_advice = "All outdoor physical activity strictly prohibited."
        mask_recommendation = "N99 / P100 respirator mandatory even for brief outdoor transit."
        air_purifier_needed = True
        action_items = [
            "Remain strictly indoors with air purifiers operating at maximum filtration",
            "GRAP Stage IV Emergency: Entry of commercial trucks stopped, primary schools shifted online, 50% work-from-home advisory",
            "Seek immediate medical attention if experiencing chest tightness, wheezing, or dizziness"
        ]

    # Persona Cards
    personas = [
        {
            "role": "Asthma & Sensitive Groups",
            "icon": "fa-lungs",
            "status": "High Risk" if aqi > 150 else ("Moderate Caution" if aqi > 80 else "Safe"),
            "advice": sensitive_advice
        },
        {
            "role": "Athletes & Fitness Enthusiasts",
            "icon": "fa-person-running",
            "status": "Prohibited Outdoors" if aqi > 250 else ("Indoor Only" if aqi > 150 else "Safe"),
            "advice": athlete_advice
        },
        {
            "role": "Children & Senior Citizens",
            "icon": "fa-person-cane",
            "status": "Stay Indoors" if aqi > 200 else ("Limit Playtime" if aqi > 100 else "Safe"),
            "advice": "Vulnerable immune systems should avoid morning exposure when pollutant density is highest near ground level."
        },
        {
            "role": "Schools & Outdoor Workplaces",
            "icon": "fa-school",
            "status": "Restricted Operations" if aqi > 300 else "Normal",
            "advice": "Suspend outdoor sports assemblies when AQI crosses 200. Ensure indoor air filtration in classrooms."
        }
    ]

    return {
        "aqi": aqi,
        "category": category,
        "color": color,
        "badge": badge,
        "grap_stage": grap_stage,
        "general_advice": general_advice,
        "mask_recommendation": mask_recommendation,
        "air_purifier_needed": air_purifier_needed,
        "action_items": action_items,
        "personas": personas,
        "peak_window": peak_hour_info
    }
