from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.weather import router as weather_router
from app.routers.routes import router as routes_router
from app.routers.emissions import router as emissions_router

app = FastAPI(title="Smart Logistics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather_router)
app.include_router(routes_router)
app.include_router(emissions_router)


@app.get("/health")
async def health():
    return {"status": "ok"}