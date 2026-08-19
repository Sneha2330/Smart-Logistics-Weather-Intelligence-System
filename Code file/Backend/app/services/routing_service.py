import os
from typing import Any, Dict, List

import httpx
from fastapi import HTTPException

from app.services.weather_service import geocode_city
from app.services.route_risk_service import assess_route_weather
from app.utils.http_client import get_httpx_verify

OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")


async def get_route_comparison(origin: str, destination: str) -> Dict[str, Any]:
    origin = origin.strip()
    destination = destination.strip()

    if not origin or not destination:
        raise HTTPException(status_code=400, detail="Origin and destination are required")

    async with httpx.AsyncClient(
        timeout=30.0,
        verify=get_httpx_verify(),
    ) as client:
        try:
            origin_geo = await geocode_city(client, origin)
            destination_geo = await geocode_city(client, destination)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Geocoding failed: {exc}")

        route_url = (
            f"{OSRM_BASE_URL}/route/v1/driving/"
            f"{origin_geo['longitude']},{origin_geo['latitude']};"
            f"{destination_geo['longitude']},{destination_geo['latitude']}"
        )

        try:
            response = await client.get(
                route_url,
                params={
                    "alternatives": "true",
                    "overview": "full",
                    "geometries": "geojson",
                    "steps": "false",
                },
            )
            response.raise_for_status()
            payload = response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Routing provider failed: {exc}")

        routes = payload.get("routes") or []
        if not routes:
            raise HTTPException(
                status_code=404,
                detail=f"No driving route found between '{origin}' and '{destination}'",
            )

        enriched_routes: List[Dict[str, Any]] = []

        for idx, route in enumerate(routes):
            geometry = route.get("geometry", {})
            coordinates = geometry.get("coordinates", [])

            duration_minutes = round((route.get("duration") or 0) / 60)
            distance_km = round((route.get("distance") or 0) / 1000, 1)

            risk = await assess_route_weather(
                client,
                geometry_coordinates=coordinates,
                duration_minutes=duration_minutes,
            )

            weighted_score = duration_minutes + risk["predictedDelayMinutes"] + round(
                risk["weatherRiskScore"] * 0.35
            )

            enriched_routes.append(
                {
                    "id": idx + 1,
                    "label": f"Route {idx + 1}",
                    "distanceKm": distance_km,
                    "durationMinutes": duration_minutes,
                    "weatherRiskScore": risk["weatherRiskScore"],
                    "weatherRiskCategory": risk["weatherRiskCategory"],
                    "predictedDelayMinutes": risk["predictedDelayMinutes"],
                    "etaWithDelayMinutes": duration_minutes + risk["predictedDelayMinutes"],
                    "reasons": risk["reasons"],
                    "geometry": geometry,
                    "score": weighted_score,
                }
            )

        best_score = min(route["score"] for route in enriched_routes)
        for route in enriched_routes:
            route["recommended"] = route["score"] == best_score

        return {
            "origin": {
                "name": origin_geo["name"],
                "lat": origin_geo["latitude"],
                "lon": origin_geo["longitude"],
            },
            "destination": {
                "name": destination_geo["name"],
                "lat": destination_geo["latitude"],
                "lon": destination_geo["longitude"],
            },
            "routes": enriched_routes,
        }