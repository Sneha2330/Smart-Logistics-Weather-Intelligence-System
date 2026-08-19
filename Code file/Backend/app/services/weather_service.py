import certifi
import asyncio
import time
from datetime import datetime
from statistics import mean
from typing import Dict, Any, List
from app.utils.http_client import get_httpx_verify
import httpx
from fastapi import HTTPException

from app.utils.weather_codes import weather_text, is_rain_or_snow, is_sunny_or_cloudy

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
GEO_URL = "https://geocoding-api.open-meteo.com/v1/search"
AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

WEATHER_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 60


# ----------------------------
# Formatting helpers (Windows-safe)
# ----------------------------

def fmt_time(iso_string: str) -> str:
    dt = datetime.fromisoformat(iso_string)
    return dt.strftime("%I:%M %p").lstrip("0")


def fmt_hour_label(iso_string: str) -> str:
    dt = datetime.fromisoformat(iso_string)
    return dt.strftime("%I %p").lstrip("0")


def fmt_day_label(index: int, iso_string: str) -> str:
    if index == 0:
        return "Today"
    if index == 1:
        return "Tomorrow"
    return datetime.fromisoformat(iso_string).strftime("%a")


def fmt_day_length(seconds_value: float) -> str:
    total_minutes = int(seconds_value // 60)
    hours = total_minutes // 60
    minutes = total_minutes % 60
    return f"{hours} hrs {minutes} mins"


def wind_direction_text(deg: float) -> str:
    directions = [
        "N", "NNE", "NE", "ENE",
        "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW",
        "W", "WNW", "NW", "NNW",
    ]
    idx = round(deg / 22.5) % 16
    return directions[idx]


def aqi_severity(aqi_value: float) -> str:
    if aqi_value <= 50:
        return "Good"
    if aqi_value <= 100:
        return "Moderate"
    if aqi_value <= 150:
        return "Poor"
    if aqi_value <= 200:
        return "Unhealthy"
    if aqi_value <= 300:
        return "Very Unhealthy"
    return "Hazardous"


# ----------------------------
# HTTP helpers
# ----------------------------

async def fetch_json(client: httpx.AsyncClient, url: str, params: Dict[str, Any]) -> Dict[str, Any]:
    response = await client.get(url, params=params, timeout=30.0)
    response.raise_for_status()
    return response.json()


async def geocode_city(client: httpx.AsyncClient, city: str) -> Dict[str, Any]:
    city = city.strip()
    if not city:
        raise HTTPException(status_code=400, detail="Location input is empty")

    data = await fetch_json(
        client,
        GEO_URL,
        {
            "name": city,
            "count": 5,
            "language": "en",
            "format": "json",
        },
    )

    results = data.get("results") or []
    if not results:
        raise HTTPException(status_code=404, detail=f"Location '{city}' not found")

    # Prefer the result with the highest population if available
    results_sorted = sorted(
        results,
        key=lambda item: item.get("population", 0),
        reverse=True,
    )

    item = results_sorted[0]

    name = item["name"]
    admin1 = item.get("admin1")
    country = item.get("country")

    display_name = ", ".join(part for part in [name, admin1, country] if part)

    return {
        "name": display_name,
        "city": name,
        "latitude": item["latitude"],
        "longitude": item["longitude"],
        "timezone": item.get("timezone", "auto"),
    }


# ----------------------------
# Builders
# ----------------------------

def build_hourly_list(
    forecast: Dict[str, Any],
    air: Dict[str, Any],
    current_time_iso: str,
) -> List[Dict[str, Any]]:
    hourly = forecast.get("hourly", {})
    times = hourly.get("time") or []

    if not times:
        return []

    temps = hourly.get("temperature_2m", [])
    precip_prob = hourly.get("precipitation_probability", [])
    humidity = hourly.get("relative_humidity_2m", [])
    wind = hourly.get("wind_speed_10m", [])
    cloud = hourly.get("cloud_cover", [])
    codes = hourly.get("weather_code", [])

    aq_hourly = air.get("hourly", {})
    aq_times = aq_hourly.get("time") or []
    aq_values = aq_hourly.get("us_aqi") or []
    aq_map = {
        aq_times[i]: round(aq_values[i])
        for i in range(min(len(aq_times), len(aq_values)))
        if aq_values[i] is not None
    }

    current_hour = current_time_iso[:13] + ":00"
    start = times.index(current_hour) if current_hour in times else 0
    end = min(start + 12, len(times))

    result: List[Dict[str, Any]] = []
    for i in range(start, end):
        result.append(
            {
                "time": "Now" if times[i] == current_hour else fmt_hour_label(times[i]),
                "timeIso": times[i],
                "temp": round(temps[i]) if i < len(temps) and temps[i] is not None else None,
                "precip": round(precip_prob[i]) if i < len(precip_prob) and precip_prob[i] is not None else 0,
                "humidity": round(humidity[i]) if i < len(humidity) and humidity[i] is not None else None,
                "wind": round(wind[i]) if i < len(wind) and wind[i] is not None else None,
                "cloudCover": round(cloud[i]) if i < len(cloud) and cloud[i] is not None else None,
                "condition": weather_text(codes[i]) if i < len(codes) and codes[i] is not None else "Unknown",
                "aqi": aq_map.get(times[i]),
            }
        )

    return result


def build_daily_list(forecast: Dict[str, Any]) -> List[Dict[str, Any]]:
    daily = forecast.get("daily", {})
    times = daily.get("time") or []

    result = []
    for i in range(min(6, len(times))):
        code = daily["weather_code"][i]
        result.append({
            "date": int(times[i][-2:]),
            "label": fmt_day_label(i, times[i]),
            "high": round(daily["temperature_2m_max"][i]),
            "low": round(daily["temperature_2m_min"][i]),
            "condition": weather_text(code),
            "weatherCode": code,   # ✅ IMPORTANT
            "sunrise": fmt_time(daily["sunrise"][i]),
            "sunset": fmt_time(daily["sunset"][i]),
            "uvMax": round(daily["uv_index_max"][i] or 0),
        })

    return result


# ----------------------------
# MAIN SERVICE
# ----------------------------

async def get_weather_dashboard_data(city: str) -> Dict[str, Any]:
    city_key = city.strip().lower()
    cached = WEATHER_CACHE.get(city_key)
    now = time.time()

    if cached and now - cached["timestamp"] < CACHE_TTL_SECONDS:
        return cached["data"]

    async with httpx.AsyncClient(timeout=30.0, verify=get_httpx_verify()) as client:
        location = await geocode_city(client, city)

        forecast_params = {
            "latitude": location["latitude"],
            "longitude": location["longitude"],
            "timezone": location["timezone"],
            "forecast_days": 14,
            "current": (
                "temperature_2m,relative_humidity_2m,apparent_temperature,"
                "precipitation,weather_code,cloud_cover,pressure_msl,"
                "wind_speed_10m,wind_direction_10m,wind_gusts_10m,"
                "visibility,dew_point_2m"
            ),
            "hourly": (
                "temperature_2m,relative_humidity_2m,apparent_temperature,"
                "precipitation_probability,precipitation,cloud_cover,"
                "wind_speed_10m,wind_direction_10m,weather_code"
            ),
            "daily": (
                "weather_code,temperature_2m_max,temperature_2m_min,"
                "sunrise,sunset,uv_index_max,precipitation_probability_max,"
                "precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,"
                "daylight_duration"
            ),
        }

        air_params = {
            "latitude": location["latitude"],
            "longitude": location["longitude"],
            "timezone": location["timezone"],
            "current": "us_aqi,european_aqi,pm2_5,pm10,ozone,uv_index",
            "hourly": "us_aqi",
        }

        forecast, air = await asyncio.gather(
            fetch_json(client, FORECAST_URL, forecast_params),
            fetch_json(client, AIR_URL, air_params),
        )

    current = forecast["current"]
    air_current = air.get("current", {})
    hourly = forecast.get("hourly", {})
    daily = forecast.get("daily", {})

    daily_list = build_daily_list(forecast)
    hourly_list = build_hourly_list(forecast, air, current["time"])

    temp = round(current["temperature_2m"])
    feels = round(current["apparent_temperature"])
    aqi = round(air_current.get("us_aqi", 0) or 0)

    # Next 24h precipitation (real mm, not fake)
    hourly_precip = hourly.get("precipitation") or []
    precip_24h = round(sum((value or 0) for value in hourly_precip[:24]), 1) if hourly_precip else 0.0

    # Monthly summary derived from live forecast window (not hardcoded)
    daily_max = daily.get("temperature_2m_max") or []
    daily_min = daily.get("temperature_2m_min") or []
    daily_codes = daily.get("weather_code") or []
    daily_times = daily.get("time") or []

    summary_window = min(10, len(daily_max), len(daily_min), len(daily_codes))

    avg_high = round(mean(daily_max[:summary_window])) if summary_window else None
    avg_low = round(mean(daily_min[:summary_window])) if summary_window else None
    sunny_cloudy_days = sum(1 for code in daily_codes[:summary_window] if is_sunny_or_cloudy(code))
    rain_snow_days = sum(1 for code in daily_codes[:summary_window] if is_rain_or_snow(code))

    now_dt = datetime.fromisoformat(current["time"])

    # Trends over available forecast days
    trends: List[Dict[str, Any]] = []
    for i in range(min(10, len(daily_times), len(daily_max), len(daily_min))):
        high = round(daily_max[i])
        low = round(daily_min[i])
        trends.append(
            {
                "label": datetime.fromisoformat(daily_times[i]).strftime("%d %b"),
                "high": high,
                "low": low,
                "avg": round((high + low) / 2, 1),
            }
        )

    sunrise = fmt_time(daily["sunrise"][0]) if daily.get("sunrise") else "—"
    sunset = fmt_time(daily["sunset"][0]) if daily.get("sunset") else "—"
    day_length = (
        fmt_day_length(daily["daylight_duration"][0])
        if daily.get("daylight_duration")
        else "—"
    )

    payload = {
        "location": location["name"],
        "city": location["city"],
        "coords": {
            "lat": location["latitude"],
            "lon": location["longitude"],
        },
        "timezone": location["timezone"],
        "updatedAt": current["time"],
        "current": {
            "time": fmt_time(current["time"]),
            "temp": temp,
            "condition": weather_text(current["weather_code"]),
            "weatherCode": current["weather_code"],
            "airQuality": aqi,
            "wind": f"{round(current['wind_speed_10m'])} km/h",
            "windDirection": f"{wind_direction_text(current['wind_direction_10m'])} ({round(current['wind_direction_10m'])}°)",
            "humidity": f"{round(current['relative_humidity_2m'])}%",
            "feelsLike": f"{feels}°",
            "visibility": f"{round((current.get('visibility') or 0) / 1000)} km",
            "uvIndex": round(air_current.get("uv_index", 0) or 0),
            "pressure": f"{round(current.get('pressure_msl') or 0)} mb",
            "dewPoint": f"{round(current.get('dew_point_2m') or 0)}°",
            "cloudCover": f"{round(current.get('cloud_cover') or 0)}%",
            "precipitation": f"{round(current.get('precipitation') or 0, 1)} mm",
        },
        "daily": daily_list,
        "hourly": hourly_list,
        "details": {
            "temperature": temp,
            "temperatureTrend": "Steady",
            "overnightLow": f"{daily_list[1]['low']}° by early morning" if len(daily_list) > 1 else "",
            "feelsLike": feels,
            "dominantFactor": "Humidity / cloud cover",
            "cloudCover": f"{round(current.get('cloud_cover') or 0)}%",
            "precipitation24h": f"{precip_24h} mm",
            "windDirection": f"From {wind_direction_text(current['wind_direction_10m'])} ({round(current['wind_direction_10m'])}°)",
            "windSpeed": f"{round(current['wind_speed_10m'])} km/h",
            "windGust": f"{round(current.get('wind_gusts_10m') or 0)} km/h",
            "humidity": f"{round(current['relative_humidity_2m'])}%",
            "dewPoint": f"{round(current.get('dew_point_2m') or 0)}°",
            "uv": round(air_current.get("uv_index", 0) or 0),
            "aqi": aqi,
            "aqiStatus": aqi_severity(aqi),
            "visibility": f"{round((current.get('visibility') or 0) / 1000)} km",
            "pressure": f"{round(current.get('pressure_msl') or 0)} mb",
            "sunrise": sunrise,
            "sunset": sunset,
            "dayLength": day_length,
            "pollutant": f"O₃ {round(air_current.get('ozone', 0) or 0)} μg/m³",
        },
        "monthly": {
            "month": now_dt.strftime("%b"),
            "year": now_dt.year,
            "sunnyCloudyDays": sunny_cloudy_days,
            "rainSnowDays": rain_snow_days,
            "avgHigh": avg_high,
            "avgLow": avg_low,
        },
        "trends": trends,
    }

    WEATHER_CACHE[city_key] = {
        "timestamp": now,
        "data": payload,
    }

    return payload