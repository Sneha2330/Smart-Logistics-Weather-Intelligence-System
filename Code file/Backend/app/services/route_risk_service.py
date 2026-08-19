import asyncio
from typing import Any, Dict, List

import httpx

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


def sample_route_points(coordinates: List[List[float]], sample_count: int = 5) -> List[Dict[str, float]]:
    """
    OSRM coordinates are [lon, lat].
    Sample evenly across the route including start/end.
    """
    if not coordinates:
        return []

    if len(coordinates) <= sample_count:
        return [{"lon": lon, "lat": lat} for lon, lat in coordinates]

    indexes = [round(i * (len(coordinates) - 1) / (sample_count - 1)) for i in range(sample_count)]
    seen = set()
    points: List[Dict[str, float]] = []

    for idx in indexes:
        if idx not in seen:
            seen.add(idx)
            lon, lat = coordinates[idx]
            points.append({"lon": lon, "lat": lat})

    return points


def weather_code_penalty(code: int | None) -> int:
    if code is None:
        return 0

    if code in {95, 96, 99}:   # thunderstorm
        return 35
    if code in {80, 81, 82}:   # showers
        return 25
    if code in {61, 63, 65, 66, 67}:  # rain / freezing rain
        return 20
    if code in {71, 73, 75, 77, 85, 86}:  # snow
        return 25
    if code in {45, 48}:       # fog
        return 20
    if code in {2, 3}:         # cloudy / overcast
        return 5
    return 0


def point_risk(current: Dict[str, Any]) -> tuple[int, List[str]]:
    score = 0
    reasons: List[str] = []

    precipitation = current.get("precipitation") or 0
    wind = current.get("wind_speed_10m") or 0
    visibility = current.get("visibility") or 99999
    cloud_cover = current.get("cloud_cover") or 0
    weather_code = current.get("weather_code")

    code_penalty = weather_code_penalty(weather_code)
    if code_penalty:
        score += code_penalty
        reasons.append("severe weather code")

    if precipitation >= 2:
        score += 20
        reasons.append("heavy precipitation")
    elif precipitation > 0:
        score += 10
        reasons.append("precipitation")

    if wind >= 45:
        score += 25
        reasons.append("high wind")
    elif wind >= 25:
        score += 15
        reasons.append("moderate wind")

    if visibility <= 2000:
        score += 25
        reasons.append("very low visibility")
    elif visibility <= 6000:
        score += 15
        reasons.append("reduced visibility")
    elif visibility <= 10000:
        score += 8
        reasons.append("limited visibility")

    if cloud_cover >= 85:
        score += 5
        reasons.append("heavy cloud cover")

    return min(score, 100), reasons


def risk_category(score: int) -> str:
    if score < 20:
        return "Low"
    if score < 45:
        return "Moderate"
    if score < 70:
        return "High"
    return "Critical"


async def fetch_point_weather(client: httpx.AsyncClient, lat: float, lon: float) -> Dict[str, Any]:
    response = await client.get(
        FORECAST_URL,
        params={
            "latitude": lat,
            "longitude": lon,
            "timezone": "auto",
            "current": ",".join(
                [
                    "precipitation",
                    "weather_code",
                    "cloud_cover",
                    "wind_speed_10m",
                    "visibility",
                ]
            ),
        },
        timeout=20.0,
    )
    response.raise_for_status()
    payload = response.json()
    return payload.get("current", {})


async def assess_route_weather(
    client: httpx.AsyncClient,
    geometry_coordinates: List[List[float]],
    duration_minutes: float,
) -> Dict[str, Any]:
    points = sample_route_points(geometry_coordinates, sample_count=5)

    if not points:
        return {
            "weatherRiskScore": 0,
            "weatherRiskCategory": "Low",
            "predictedDelayMinutes": 0,
            "reasons": [],
            "sampleCount": 0,
        }

    current_points = await asyncio.gather(
        *[fetch_point_weather(client, point["lat"], point["lon"]) for point in points]
    )

    scores: List[int] = []
    reasons_union: List[str] = []

    for current in current_points:
        score, reasons = point_risk(current)
        scores.append(score)
        for reason in reasons:
            if reason not in reasons_union:
                reasons_union.append(reason)

    avg_score = round(sum(scores) / len(scores)) if scores else 0
    max_score = max(scores) if scores else 0

    # Blend average and max risk so one severe segment still matters
    final_score = round(avg_score * 0.7 + max_score * 0.3)
    predicted_delay = round(duration_minutes * (final_score / 100) * 0.35)

    return {
        "weatherRiskScore": final_score,
        "weatherRiskCategory": risk_category(final_score),
        "predictedDelayMinutes": predicted_delay,
        "reasons": reasons_union,
        "sampleCount": len(points),
    }