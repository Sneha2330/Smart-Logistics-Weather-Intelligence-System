"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  getWeather,
  getForecast,
  getRoutePrediction,
  DEFAULT_CITY,
  DEFAULT_LAT,
  DEFAULT_LON,
} from "@/lib/api";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [shipments, setShipments] = useState([{ id: 1, lat: DEFAULT_LAT, lon: DEFAULT_LON }]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [routePrediction, setRoutePrediction] = useState(null);
  const [emissionData, setEmissionData] = useState(null);

  const [searchTerm, setSearchTerm] = useState(DEFAULT_CITY);
  const [loading, setLoading] = useState(true);

  const [errors, setErrors] = useState({
    weather: "",
    forecast: "",
    route: "",
  });

  const loadShipmentInsights = useCallback(async () => {
    const shipment = shipments?.[0] || { id: 1, lat: DEFAULT_LAT, lon: DEFAULT_LON };
    const shipmentId = shipment?.id ?? 1;
    const lat = shipment?.lat ?? DEFAULT_LAT;
    const lon = shipment?.lon ?? DEFAULT_LON;
    const q = searchTerm?.trim() || `${lat},${lon}`;

    const [weather, forecast, route] = await Promise.all([
      getWeather({ shipmentId, lat, lon, q }),
      getForecast({ shipmentId, lat, lon, q }),
      getRoutePrediction(),
    ]);

    setWeatherData(weather);
    setForecastData(forecast);
    setRoutePrediction(route);

    setErrors({
      weather: weather ? "" : "Current weather unavailable",
      forecast: forecast ? "" : "Forecast unavailable",
      route: route ? "" : "Route prediction unavailable",
    });

    // optional placeholder if you don't yet have emissions backend data
    setEmissionData((prev) => prev ?? { threshold_exceeded: false });
  }, [shipments, searchTerm]);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      await loadShipmentInsights();
    } finally {
      setLoading(false);
    }
  }, [loadShipmentInsights]);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        await loadShipmentInsights();
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [loadShipmentInsights]);

  const value = useMemo(
    () => ({
      shipments,
      setShipments,
      weatherData,
      forecastData,
      routePrediction,
      emissionData,
      searchTerm,
      setSearchTerm,
      refreshAll,
      loading,
      errors,
    }),
    [
      shipments,
      weatherData,
      forecastData,
      routePrediction,
      emissionData,
      searchTerm,
      refreshAll,
      loading,
      errors,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}