const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010";
const DEFAULT_CITY = process.env.NEXT_PUBLIC_DEFAULT_CITY || "Location";
const DEFAULT_LAT = Number(process.env.NEXT_PUBLIC_DEFAULT_LAT || 12.9716);
const DEFAULT_LON = Number(process.env.NEXT_PUBLIC_DEFAULT_LON || 77.5946);
const ROUTE_PREDICT_PATH =
  process.env.NEXT_PUBLIC_ROUTE_PREDICT_PATH || "/route/predict";

function buildWeatherParams({ shipmentId = 1, lat = DEFAULT_LAT, lon = DEFAULT_LON, q } = {}) {
  const params = new URLSearchParams();

  if (shipmentId !== undefined && shipmentId !== null) {
    params.set("shipment_id", String(shipmentId));
  }

  if (lat !== undefined && lat !== null) {
    params.set("lat", String(lat));
  }

  if (lon !== undefined && lon !== null) {
    params.set("lon", String(lon));
  }

  const query =
    (typeof q === "string" && q.trim()) ||
    (lat !== undefined && lon !== undefined ? `${lat},${lon}` : DEFAULT_CITY);

  // IMPORTANT: backend requires q
  params.set("q", query);

  return params;
}

async function requestJson(url, fallbackMessage, options = {}) {
  const {
    timeoutMs = 10000,
    method = "GET",
    headers,
    body,
    cache = "no-store",
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
      cache,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `${fallbackMessage}: ${res.status} ${res.statusText} | URL: ${url} | Response: ${text}`
      );
    }

    return await res.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`${fallbackMessage}: request timed out | URL: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function safeRequestJson(url, fallbackMessage, options = {}) {
  try {
    return await requestJson(url, fallbackMessage, options);
  } catch (error) {
    console.warn(error.message);
    return null;
  }
}

export async function getWeather(args = {}) {
  const params = buildWeatherParams(args);
  const url = `${API_BASE}/weather/search?${params.toString()}`;

  return await safeRequestJson(url, "Failed to fetch weather", {
    timeoutMs: 8000,
  });
}

export async function getForecast(args = {}) {
  const params = buildWeatherParams(args);

  // Try forecast first
  const forecastUrl = `${API_BASE}/weather/forecast?${params.toString()}`;
  const forecast = await safeRequestJson(forecastUrl, "Failed to fetch forecast", {
    timeoutMs: 8000,
  });

  if (forecast) {
    return forecast;
  }

  // Fallback to search/current weather so dashboard still works
  const searchUrl = `${API_BASE}/weather/search?${params.toString()}`;
  const current = await safeRequestJson(searchUrl, "Failed to fetch weather", {
    timeoutMs: 8000,
  });

  if (!current) {
    return null;
  }

  return {
    ...current,
    _degraded: true,
  };
}

export async function getRoutePrediction() {
  const url = `${API_BASE}${ROUTE_PREDICT_PATH}`;

  // Route prediction is optional — do not crash dashboard if missing
  const result = await safeRequestJson(url, "Failed to predict route", {
    timeoutMs: 5000,
  });

  return result;
}

export { DEFAULT_CITY, DEFAULT_LAT, DEFAULT_LON };