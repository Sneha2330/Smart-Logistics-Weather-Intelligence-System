import json
from pathlib import Path
from typing import Any, Dict

from app.services.routing_service import get_route_comparison

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "emission_factors.json"


def load_factors() -> Dict[str, Any]:
    if not CONFIG_PATH.exists():
        raise HTTPException(status_code=500, detail="Emission factors config not found")
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def alert_level(co2_kg: float) -> str:
    if co2_kg < 10:
        return "Low"
    if co2_kg < 25:
        return "Moderate"
    if co2_kg < 45:
        return "High"
    return "Critical"


async def get_emissions_estimate(
    origin: str,
    destination: str,
    vehicle_type: str,
    fuel_type: str,
    consumption_per_km: float,
    load_factor: float = 1.0,
) -> Dict[str, Any]:
    if consumption_per_km <= 0:
        raise HTTPException(status_code=400, detail="consumption_per_km must be greater than 0")

    if load_factor <= 0:
        load_factor = 1.0

    factors = load_factors()
    fuel_key = fuel_type.strip().lower()

    if fuel_key not in factors:
        raise HTTPException(status_code=400, detail=f"Unsupported fuel type: {fuel_type}")

    route_data = await get_route_comparison(origin, destination)
    recommended = next((route for route in route_data["routes"] if route["recommended"]), None)

    if not recommended:
        raise HTTPException(status_code=404, detail="No recommended route available")

    distance_km = recommended["distanceKm"]
    eta_minutes = recommended["etaWithDelayMinutes"]

    factor_info = factors[fuel_key]
    usage_unit = factor_info["unit"]
    co2_per_unit = factor_info["co2_per_unit"]

    estimated_usage = round(distance_km * consumption_per_km * load_factor, 2)
    estimated_co2 = round(estimated_usage * co2_per_unit, 2)

    threshold_exceeded = estimated_co2 >= 25
    level = alert_level(estimated_co2)

    sustainability_score = max(0, round(100 - estimated_co2 * 2))

    return {
        "origin": route_data["origin"],
        "destination": route_data["destination"],
        "recommendedRoute": {
            "label": recommended["label"],
            "distanceKm": distance_km,
            "etaWithDelayMinutes": eta_minutes,
            "predictedDelayMinutes": recommended["predictedDelayMinutes"],
            "weatherRiskScore": recommended["weatherRiskScore"],
            "weatherRiskCategory": recommended["weatherRiskCategory"]
        },
        "vehicleType": vehicle_type,
        "fuelType": fuel_type,
        "consumptionPerKm": consumption_per_km,
        "loadFactor": load_factor,
        "usageUnit": usage_unit,
        "estimatedUsage": estimated_usage,
        "estimatedCo2Kg": estimated_co2,
        "thresholdExceeded": threshold_exceeded,
        "alertLevel": level,
        "sustainabilityScore": sustainability_score
    }