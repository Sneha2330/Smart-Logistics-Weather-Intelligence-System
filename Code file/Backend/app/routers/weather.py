from fastapi import APIRouter, HTTPException, Query

from app.services.weather_service import get_weather_dashboard_data

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/dashboard")
async def weather_dashboard(city: str = Query(..., min_length=2)):
    try:
        return await get_weather_dashboard_data(city)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))