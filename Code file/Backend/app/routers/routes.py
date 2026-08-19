from fastapi import APIRouter, HTTPException, Query

from app.services.routing_service import get_route_comparison

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("/compare")
async def compare_routes(
    origin: str = Query(..., min_length=2),
    destination: str = Query(..., min_length=2),
):
    try:
        return await get_route_comparison(origin, destination)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))