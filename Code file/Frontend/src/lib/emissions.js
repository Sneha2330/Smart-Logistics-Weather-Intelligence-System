const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set in .env.local");
}

export async function getEmissionsEstimate({
  origin,
  destination,
  vehicleType,
  fuelType,
  consumptionPerKm,
  loadFactor,
}) {
  const url =
    `${API_BASE}/emissions/estimate` +
    `?origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(destination)}` +
    `&vehicle_type=${encodeURIComponent(vehicleType)}` +
    `&fuel_type=${encodeURIComponent(fuelType)}` +
    `&consumption_per_km=${encodeURIComponent(consumptionPerKm)}` +
    `&load_factor=${encodeURIComponent(loadFactor)}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  const raw = await response.text();

  let payload;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = raw;
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload?.detail
        ? payload.detail
        : typeof payload === "string"
        ? payload
        : `HTTP ${response.status}`;

    throw new Error(
      `Failed to estimate emissions: ${response.status} - ${detail}`
    );
  }

  return payload;
}